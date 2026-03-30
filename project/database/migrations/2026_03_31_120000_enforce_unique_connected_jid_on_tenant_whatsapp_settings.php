<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->cleanupConnectedJidDuplicates();

        DB::statement(
            'CREATE UNIQUE INDEX tenant_whatsapp_settings_connected_jid_active_unique
            ON tenant_whatsapp_settings (connected_jid)
            WHERE connected_jid IS NOT NULL'
        );
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS tenant_whatsapp_settings_connected_jid_active_unique');
    }

    private function cleanupConnectedJidDuplicates(): void
    {
        $duplicateJids = DB::table('tenant_whatsapp_settings')
            ->whereNotNull('connected_jid')
            ->groupBy('connected_jid')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('connected_jid');

        $now = now()->toIso8601String();

        foreach ($duplicateJids as $jid) {
            $rows = DB::table('tenant_whatsapp_settings')
                ->where('connected_jid', $jid)
                ->orderBy('updated_at', 'asc')
                ->orderBy('id', 'asc')
                ->get(['id', 'tenant_id', 'meta']);

            if ($rows->count() <= 1) {
                continue;
            }

            $keeper = $rows->first();
            $losers = $rows->slice(1);

            foreach ($losers as $loser) {
                $meta = $this->decodeMeta($loser->meta);
                $meta['disconnect_reason'] = 'jid_conflict_migration';
                $meta['lifecycle_state'] = 'jid_conflict_migration';
                $meta['restore_eligible'] = false;
                $meta['conflict_connected_jid'] = $jid;
                $meta['conflict_owner_tenant_id'] = (int) $keeper->tenant_id;
                $meta['conflict_at'] = $now;
                unset($meta['qr_data_url'], $meta['qr_text']);

                DB::table('tenant_whatsapp_settings')
                    ->where('id', $loser->id)
                    ->update([
                        'connection_status' => 'disconnected',
                        'connected_jid' => null,
                        'auto_connect' => false,
                        'meta' => json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        'updated_at' => $now,
                    ]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeMeta(mixed $meta): array
    {
        if (is_array($meta)) {
            return $meta;
        }

        if (!is_string($meta) || trim($meta) === '') {
            return [];
        }

        $decoded = json_decode($meta, true);
        return is_array($decoded) ? $decoded : [];
    }
};
