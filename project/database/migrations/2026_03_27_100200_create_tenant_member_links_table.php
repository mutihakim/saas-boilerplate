<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_member_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants');
            $table->foreignId('member_id')->constrained('tenant_members');
            $table->foreignId('linked_member_id')->constrained('tenant_members');
            $table->string('link_type', 50);
            $table->string('access_scope', 100)->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_member_links');
    }
};
