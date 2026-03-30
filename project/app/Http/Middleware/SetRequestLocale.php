<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetRequestLocale
{
    /**
     * @var string[]
     */
    private array $supported = ['en', 'id'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolveLocale($request);
        App::setLocale($locale);

        return $next($request);
    }

    private function resolveLocale(Request $request): string
    {
        $headerLocale = strtolower((string) $request->header('X-Locale', ''));
        if (in_array($headerLocale, $this->supported, true)) {
            return $headerLocale;
        }

        $acceptLanguage = strtolower((string) $request->header('Accept-Language', ''));
        foreach ($this->supported as $locale) {
            if (str_starts_with($acceptLanguage, $locale)) {
                return $locale;
            }
        }

        return (string) config('app.locale', 'en');
    }
}
