<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Tenant;
use App\Support\ApiResponder;
use App\Support\SubscriptionEntitlements;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TenantSubscriptionController extends Controller
{
    use ApiResponder;

    public function __construct(private readonly SubscriptionEntitlements $entitlements)
    {
    }

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->is_superadmin, 403);

        $tenants = Tenant::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Tenant $tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'status' => $tenant->status,
                'plan_code' => $this->entitlements->normalizePlan($tenant->plan_code),
                'entitlements' => $this->entitlements->moduleMapForTenant($tenant),
            ])
            ->values();

        return Inertia::render('Admin/TenantSubscriptions', [
            'tenants' => $tenants,
            'plans' => $this->entitlements->availablePlans(),
            'moduleLabels' => config('subscription_entitlements.module_labels', []),
            'limitLabels' => config('subscription_entitlements.limit_labels', []),
            'planLimits' => collect($this->entitlements->availablePlans())->mapWithKeys(fn (string $plan) => [
                $plan => (array) (config("subscription_entitlements.plans.{$plan}.limits", [])),
            ])->all(),
        ]);
    }

    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        abort_unless($request->user()?->is_superadmin, 403);

        $payload = $request->validate([
            'plan_code' => ['required', 'string'],
        ]);

        $plan = $this->entitlements->normalizePlan($payload['plan_code']);
        if ($payload['plan_code'] !== $plan) {
            return $this->error('VALIDATION_ERROR', 'Invalid subscription plan code.', [
                'fields' => ['plan_code' => ['Invalid subscription plan code.']],
            ], 422);
        }

        DB::transaction(function () use ($request, $tenant, $plan) {
            $before = $tenant->plan_code;
            $tenant->update(['plan_code' => $plan]);

            ActivityLog::create([
                'tenant_id' => $tenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => null,
                'action' => 'tenant.subscription.updated',
                'target_type' => 'tenants',
                'target_id' => (string) $tenant->id,
                'changes' => ['before' => ['plan_code' => $before], 'after' => ['plan_code' => $plan]],
                'metadata' => ['channel' => 'web_admin'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => null,
                'after_version' => null,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return $this->ok([
            'tenant' => [
                'id' => $tenant->id,
                'slug' => $tenant->slug,
                'plan_code' => $plan,
                'entitlements' => $this->entitlements->moduleMapForTenant($tenant->fresh()),
            ],
        ]);
    }
}
