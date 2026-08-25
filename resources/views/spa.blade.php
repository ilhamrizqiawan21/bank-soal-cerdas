<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <title>Bank Soal Cerdas</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('images/favicon.ico') }}">
    @viteReactRefresh
    @vite('src/main.tsx')
</head>
<body class="bg-slate-50 text-slate-900 antialiased min-h-screen">
    <div id="root"></div>
    <script type="application/json" id="spa-bootstrap">@json(['user' => auth()->user()?->only(['id', 'name', 'email', 'role', 'is_active'])])</script>
</body>
</html>
