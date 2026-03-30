<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants');
            $table->foreignId('actor_user_id')->constrained('users');
            $table->string('endpoint', 190);
            $table->string('idempotency_key', 190);
            $table->string('request_hash', 64);
            $table->json('response_payload')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['tenant_id', 'actor_user_id', 'endpoint', 'idempotency_key'], 'idem_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idempotency_keys');
    }
};
