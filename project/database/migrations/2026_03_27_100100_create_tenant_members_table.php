<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('full_name');
            $table->string('role_code', 50);
            $table->string('profile_status', 30)->default('active');
            $table->unsignedBigInteger('row_version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'role_code']);
            $table->index(['tenant_id', 'profile_status']);
            $table->unique(['tenant_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_members');
    }
};
