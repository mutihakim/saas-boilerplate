@extends('errors.layout')

@section('title', '404 Not Found')

@section('content')
    <img
        src="{{ Vite::asset('resources/images/error400-cover.png') }}"
        alt="404 Not Found"
        class="img-fluid error-image mx-auto d-block"
    >
    <h1 class="h3 mt-4 mb-2 text-uppercase">404 - Page Not Found</h1>
    <p class="muted-copy mb-4">
        Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
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
