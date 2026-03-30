<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_members', function (Blueprint $table) {
            $table->string('onboarding_status', 30)->default('no_account')->after('profile_status');
            $table->index(['tenant_id', 'onboarding_status'], 'tenant_members_onboarding_idx');
        });

        Schema::table('tenant_invitations', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('email');
        });

        DB::table('tenant_members')->whereNull('user_id')->update(['onboarding_status' => 'no_account']);
        DB::table('tenant_members')->whereNotNull('user_id')->update(['onboarding_status' => 'account_active']);

        $pendingMemberIds = DB::table('tenant_invitations')
            ->where('status', 'pending')
            ->whereNotNull('member_id')
            ->distinct()
            ->pluck('member_id')
            ->filter()
            ->values()
            ->all();

        if (!empty($pendingMemberIds)) {
            DB::table('tenant_members')
                ->whereIn('id', $pendingMemberIds)
                ->whereNull('user_id')
                ->update(['onboarding_status' => 'invitation_pending']);
        }

        DB::table('tenant_invitations')
            ->whereNull('full_name')
            ->whereNotNull('member_id')
            ->orderBy('id')
            ->chunkById(200, function ($invitations): void {
                $memberNames = DB::table('tenant_members')
                    ->whereIn('id', $invitations->pluck('member_id')->all())
                    ->pluck('full_name', 'id');

                foreach ($invitations as $invitation) {
                    $name = $memberNames[$invitation->member_id] ?? null;
                    if (!$name) {
                        continue;
                    }

                    DB::table('tenant_invitations')
                        ->where('id', $invitation->id)
                        ->update(['full_name' => $name]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('tenant_invitations', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });

        Schema::table('tenant_members', function (Blueprint $table) {
            $table->dropIndex('tenant_members_onboarding_idx');
            $table->dropColumn('onboarding_status');
        });
    }
};
