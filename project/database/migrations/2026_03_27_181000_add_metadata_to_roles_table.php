<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('name');
            $table->unsignedInteger('row_version')->default(1)->after('display_name');
            $table->boolean('is_system')->default(false)->after('row_version');
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'row_version', 'is_system']);
        });
    }
};