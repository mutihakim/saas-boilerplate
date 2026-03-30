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
            $table->string('whatsapp_jid', 60)->nullable()->after('profile_status');
            $table->index(['tenant_id', 'whatsapp_jid'], 'tenant_members_tenant_jid_idx');
        });

        DB::statement('CREATE UNIQUE INDEX tenant_members_active_whatsapp_jid_unique ON tenant_members (tenant_id, whatsapp_jid) WHERE whatsapp_jid IS NOT NULL AND deleted_at IS NULL');

        Schema::create('tenant_whatsapp_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('tenant_members')->nullOnDelete();
            $table->string('jid', 60);
            $table->string('contact_type', 20)->default('external');
            $table->string('display_name', 255)->nullable();
            $table->timestampTz('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'jid']);
            $table->index(['tenant_id', 'contact_type']);
            $table->index(['tenant_id', 'last_message_at']);
        });

        Schema::table('tenant_whatsapp_messages', function (Blueprint $table) {
            $table->string('chat_jid', 60)->nullable()->after('recipient_jid');
            $table->timestampTz('read_at')->nullable()->after('payload');
            $table->index(['tenant_id', 'chat_jid', 'created_at'], 'tenant_whatsapp_messages_chat_idx');
            $table->index(['tenant_id', 'direction', 'read_at'], 'tenant_whatsapp_messages_read_idx');
        });

        DB::statement(
            "UPDATE tenant_whatsapp_messages
             SET chat_jid = CASE
                 WHEN direction = 'incoming' THEN sender_jid
                 ELSE recipient_jid
             END
             WHERE chat_jid IS NULL"
        );
    }

    public function down(): void
    {
        Schema::table('tenant_whatsapp_messages', function (Blueprint $table) {
            $table->dropIndex('tenant_whatsapp_messages_chat_idx');
            $table->dropIndex('tenant_whatsapp_messages_read_idx');
            $table->dropColumn(['chat_jid', 'read_at']);
        });

        Schema::dropIfExists('tenant_whatsapp_contacts');

        DB::statement('DROP INDEX IF EXISTS tenant_members_active_whatsapp_jid_unique');

        Schema::table('tenant_members', function (Blueprint $table) {
            $table->dropIndex('tenant_members_tenant_jid_idx');
            $table->dropColumn('whatsapp_jid');
        });
    }
};

