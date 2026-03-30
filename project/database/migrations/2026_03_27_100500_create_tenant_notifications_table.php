<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants');
            $table->foreignId('member_id')->nullable()->constrained('tenant_members');
            $table->string('notification_type', 100);
            $table->json('payload')->nullable();
            $table->timestampTz('read_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'notification_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_notifications');
    }
};
