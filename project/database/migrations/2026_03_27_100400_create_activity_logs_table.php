<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants');
            $table->foreignId('actor_user_id')->nullable()->constrained('users');
            $table->foreignId('actor_member_id')->nullable()->constrained('tenant_members');
            $table->string('action', 120);
            $table->string('target_type', 120);
            $table->string('target_id', 120);
            $table->json('changes')->nullable();
            $table->json('metadata')->nullable();
            $table->string('request_id', 120)->nullable();
            $table->timestampTz('occurred_at');
            $table->string('result_status', 20);
            $table->unsignedBigInteger('before_version')->nullable();
            $table->unsignedBigInteger('after_version')->nullable();
            $table->string('source_ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['tenant_id', 'occurred_at']);
            $table->index(['tenant_id', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
