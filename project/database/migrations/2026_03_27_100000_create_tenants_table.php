<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_user_id')->constrained('users');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('locale', 10)->default('id');
            $table->string('timezone', 64)->default('UTC');
            $table->string('plan_code', 50)->default('free');
            $table->string('status', 30)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
