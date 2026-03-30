<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $table->string('display_name')->nullable()->after('slug');
            $table->string('legal_name')->nullable()->after('display_name');
            $table->string('registration_number')->nullable()->after('legal_name');
            $table->string('tax_id')->nullable()->after('registration_number');
            $table->string('industry')->nullable()->after('tax_id');
            $table->string('website_url')->nullable()->after('industry');
            $table->string('support_email')->nullable()->after('website_url');
            $table->string('billing_email')->nullable()->after('support_email');
            $table->string('billing_contact_name')->nullable()->after('billing_email');
            $table->string('phone', 50)->nullable()->after('billing_contact_name');
            $table->string('address_line_1')->nullable()->after('phone');
            $table->string('address_line_2')->nullable()->after('address_line_1');
            $table->string('city')->nullable()->after('address_line_2');
            $table->string('state_region')->nullable()->after('city');
            $table->string('postal_code', 40)->nullable()->after('state_region');
            $table->string('country_code', 2)->nullable()->after('postal_code');
            $table->string('currency_code', 3)->nullable()->after('timezone');
            $table->string('logo_light_path')->nullable()->after('status');
            $table->string('logo_dark_path')->nullable()->after('logo_light_path');
            $table->string('logo_icon_path')->nullable()->after('logo_dark_path');
            $table->string('favicon_path')->nullable()->after('logo_icon_path');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $table->dropColumn([
                'display_name',
                'legal_name',
                'registration_number',
                'tax_id',
                'industry',
                'website_url',
                'support_email',
                'billing_email',
                'billing_contact_name',
                'phone',
                'address_line_1',
                'address_line_2',
                'city',
                'state_region',
                'postal_code',
                'country_code',
                'currency_code',
                'logo_light_path',
                'logo_dark_path',
                'logo_icon_path',
                'favicon_path',
            ]);
        });
    }
};
