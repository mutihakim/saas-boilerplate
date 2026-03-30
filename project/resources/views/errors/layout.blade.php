<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Error') - {{ config('app.name', 'appsah') }}</title>
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
    >
    <style>
        body {
            min-height: 100vh;
            background: linear-gradient(180deg, #f3f6f9 0%, #eef1f7 100%);
        }
        .error-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }
        .error-card {
            width: 100%;
            max-width: 860px;
            border: 0;
            border-radius: 1rem;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .error-image {
            max-height: 280px;
            width: auto;
        }
        .muted-copy {
            color: #74788d;
        }
    </style>
</head>
<body>
<main class="error-shell">
    <div class="card error-card">
        <div class="card-body p-4 p-sm-5 text-center">
            @yield('content')
        </div>
    </div>
</main>
</body>
</html>
