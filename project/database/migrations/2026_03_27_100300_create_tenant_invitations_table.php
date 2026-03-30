<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants');
            $table->foreignId('member_id')->nullable()->constrained('tenant_members');
            $table->foreignId('invited_by_user_id')->constrained('users');
            $table->string('email');
            $table->string('role_code', 50);
            $table->string('status', 30)->default('pending');
            $table->string('token')->unique();
            $table->timestampTz('expires_at');
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->unique(['tenant_id', 'email', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_invitations');
    }
};
