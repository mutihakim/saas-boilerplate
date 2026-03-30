<?php

namespace App\Exceptions;

use App\Support\ApiResponder;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponder;

    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->renderable(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return $this->error(
                    'VALIDATION_ERROR',
                    '',
                    ['fields' => $e->errors()],
                    422
                );
            }
        });

        $this->renderable(function (AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return $this->error(
                    'FORBIDDEN',
                    '',
                    [],
                    403
                );
            }
        });

        $this->renderable(function (TokenMismatchException $e, $request) {
            if ($request->is('api/*')) {
                return $this->error(
                    'CSRF_TOKEN_MISMATCH',
                    '',
                    [],
                    419
                );
            }
        });

        $this->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return $this->error('NOT_FOUND', '', [], 404);
            }
        });

        $this->reportable(function (Throwable $e) {
            //
        });
    }

    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->is('api/*')) {
            return $this->error(
                'UNAUTHENTICATED',
                '',
                [],
                401
            );
        }

        return parent::unauthenticated($request, $exception);
    }
}
