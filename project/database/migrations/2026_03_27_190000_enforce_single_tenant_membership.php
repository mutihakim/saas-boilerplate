<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE tenant_members DROP CONSTRAINT IF EXISTS tenant_members_tenant_id_user_id_unique');
        DB::statement('CREATE UNIQUE INDEX tenant_members_user_id_active_unique ON tenant_members (user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP INDEX IF EXISTS tenant_members_user_id_active_unique');
        DB::statement('ALTER TABLE tenant_members ADD CONSTRAINT tenant_members_tenant_id_user_id_unique UNIQUE (tenant_id, user_id)');
    }
};
