<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('job_title')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('job_title');
            $table->string('avatar_url')->nullable()->after('bio');
            $table->string('address_line')->nullable()->after('avatar_url');
            $table->string('city')->nullable()->after('address_line');
            $table->string('country')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('country');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'job_title',
                'bio',
                'avatar_url',
                'address_line',
                'city',
                'country',
                'postal_code',
            ]);
        });
    }
};