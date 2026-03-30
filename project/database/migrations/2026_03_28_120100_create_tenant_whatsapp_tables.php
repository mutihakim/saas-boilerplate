<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_whatsapp_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('session_name', 120);
            $table->string('connection_status', 30)->default('disconnected');
            $table->string('connected_jid', 60)->nullable();
            $table->boolean('auto_connect')->default(true);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique('tenant_id');
            $table->index(['tenant_id', 'connection_status']);
        });

        Schema::create('tenant_whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('direction', 20);
            $table->string('whatsapp_message_id', 120);
            $table->string('sender_jid', 60)->nullable();
            $table->string('recipient_jid', 60)->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'direction', 'whatsapp_message_id'], 'tenant_whatsapp_messages_dedupe');
            $table->index(['tenant_id', 'created_at']);
        });

        Schema::create('tenant_whatsapp_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('tenant_members')->nullOnDelete();
            $table->string('notification_type', 80);
            $table->string('notification_key', 160);
            $table->string('status', 30)->default('sent');
            $table->json('context')->nullable();
            $table->json('service_response')->nullable();
            $table->timestampTz('sent_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'notification_key'], 'tenant_whatsapp_notifications_dedupe');
            $table->index(['tenant_id', 'status']);
        });

        Schema::create('tenant_whatsapp_command_contexts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('sender_jid', 60);
            $table->string('context_type', 80);
            $table->json('payload')->nullable();
            $table->timestampTz('expires_at');
            $table->timestamps();

            $table->index(['tenant_id', 'sender_jid', 'context_type']);
            $table->index(['tenant_id', 'expires_at']);
        });

        Schema::create('tenant_whatsapp_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('sender_jid', 60)->nullable();
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size_bytes');
            $table->string('storage_path', 255);
            $table->json('meta')->nullable();
            $table->timestampTz('consumed_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
            $table->index(['tenant_id', 'consumed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_whatsapp_media');
        Schema::dropIfExists('tenant_whatsapp_command_contexts');
        Schema::dropIfExists('tenant_whatsapp_notifications');
        Schema::dropIfExists('tenant_whatsapp_messages');
        Schema::dropIfExists('tenant_whatsapp_settings');
    }
};

