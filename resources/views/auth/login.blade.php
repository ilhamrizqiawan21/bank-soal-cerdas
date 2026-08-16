<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Bank Soal Cerdas</title>
    @vite(['resources/css/app.css'])
    <style>
        body { 
            background: #f1f5f9; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; 
            font-family: 'Inter', sans-serif;
        }
        .login-card { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            width: 100%; 
            max-width: 400px; 
        }
        .login-card h4 {
            color: #0f172a;
        }
        .btn-primary {
            background: #3b82f6;
            border: none;
        }
        .btn-primary:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="text-center mb-4">
            <h4 class="fw-bold">Bank Soal Cerdas</h4>
            <p class="text-muted small">Login untuk mengelola bank soal</p>
        </div>
        
        @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif
        
        @if($errors->any())
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                @foreach($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif
        
        <form method="POST" action="{{ route('login') }}">
            @csrf
            <div class="mb-3">
                <label class="form-label fw-bold">Email</label>
                <input type="email" name="email" class="form-control" value="{{ old('email') }}" required autofocus>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Password</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" name="remember" class="form-check-input" id="remember">
                <label class="form-check-label" for="remember">Ingat saya</label>
            </div>
            <button type="submit" class="btn btn-primary w-100 py-2">Login</button>
        </form>
        
        <div class="text-center mt-4">
            <small class="text-muted">
                <strong>Demo Akun:</strong><br>
                admin@banksoal.com / password123
            </small>
        </div>
    </div>
    
    @vite(['resources/js/app.js'])
</body>
</html>