@extends('errors.layout')

@section('title', '500 Server Error')

@section('content')
    <img
        src="{{ Vite::asset('resources/images/error500.png') }}"
        alt="500 Server Error"
        class="img-fluid error-image mx-auto d-block"
    >
    <h1 class="h3 mt-4 mb-2 text-uppercase">500 - Internal Server Error</h1>
    <p class="muted-copy mb-4">
        Terjadi kendala di server. Silakan coba lagi beberapa saat lagi.
    </p>
    <div class="d-flex justify-content-center gap-2 flex-wrap">
        <button type="button" class="btn btn-light" onclick="window.history.back();">
            Back
        </button>
        <a href="{{ url('/') }}" class="btn btn-primary">
            Back to Home
        </a>
    </div>
@endsection
