<!DOCTYPE html>
<html lang="id" id="login-html">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Bank Soal Cerdas</title>
    @vite(['resources/sass/app.scss', 'resources/js/app.js'])
    <style>
        /* ===== LOGIN PAGE ===== */
        #login-html, #login-html body {
            height: 100%;
        }

        .login-shell {
            min-height: 100vh;
            display: grid;
            grid-template-columns: 1fr 480px;
        }

        /* Panel kiri — ilustrasi/branding */
        .login-panel {
            background: linear-gradient(135deg, #0f172a 0%, #1e3a6e 60%, #1d4ed8 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px;
            position: relative;
            overflow: hidden;
        }

        .login-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .login-panel-logo {
            width: 64px;
            height: 64px;
            border-radius: 18px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            margin-bottom: 24px;
            box-shadow: 0 12px 32px rgba(59,130,246,0.35);
            position: relative;
        }

        .login-panel h1 {
            color: white;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin-bottom: 12px;
            text-align: center;
            position: relative;
        }

        .login-panel p {
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            line-height: 1.6;
            text-align: center;
            max-width: 320px;
            position: relative;
        }

        .login-panel-features {
            margin-top: 40px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            width: 100%;
            max-width: 320px;
            position: relative;
        }

        .login-feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            color: rgba(255,255,255,0.75);
            font-size: 13px;
        }

        .login-feature-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 13px;
            color: #93c5fd;
        }

        /* Panel kanan — form */
        .login-form-panel {
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 40px;
            position: relative;
        }

        .login-form-inner {
            width: 100%;
            max-width: 360px;
        }

        .login-form-header {
            margin-bottom: 32px;
        }

        .login-form-header h2 {
            color: #0f172a;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.025em;
            margin-bottom: 6px;
        }

        .login-form-header p {
            color: #64748b;
            font-size: 14px;
        }

        .login-input-group {
            position: relative;
        }

        .login-input-group .form-control {
            height: 48px;
            border-radius: 10px;
            border: 1.5px solid #e2e8f0;
            padding: 0 44px 0 14px;
            font-size: 14px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .login-input-group .form-control:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .login-input-group .input-icon {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            cursor: pointer;
            font-size: 15px;
            transition: color 0.2s;
            background: none;
            border: none;
            padding: 0;
            line-height: 1;
        }

        .login-input-group .input-icon:hover {
            color: #3b82f6;
        }

        .login-btn {
            height: 48px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.01em;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            border: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px rgba(59,130,246,0.3);
        }

        .login-btn:hover {
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            box-shadow: 0 6px 20px rgba(59,130,246,0.4);
            transform: translateY(-1px);
        }

        .login-btn:active {
            transform: translateY(0);
        }

        .login-footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }

        /* Dark mode untuk form panel */
        [data-bs-theme="dark"] .login-form-panel {
            background: #0f172a;
        }

        [data-bs-theme="dark"] .login-form-header h2 {
            color: #f1f5f9;
        }

        [data-bs-theme="dark"] .login-input-group .form-control {
            background: #1e293b;
            border-color: rgba(255,255,255,0.1);
            color: #e2e8f0;
        }

        [data-bs-theme="dark"] .login-input-group .form-control:focus {
            border-color: #3b82f6;
            background: #1e293b;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .login-shell {
                grid-template-columns: 1fr;
            }
            .login-panel {
                display: none;
            }
            .login-form-panel {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<body x-data="loginPage()" :data-bs-theme="dark ? 'dark' : 'light'" x-init="init()">

<div class="login-shell">
    <!-- Panel Kiri: Branding -->
    <div class="login-panel">
        <div class="login-panel-logo">
            <i class="fas fa-database"></i>
        </div>
        <h1>Bank Soal Cerdas</h1>
        <p>Platform pengelolaan soal ujian berbasis kurikulum untuk pendidikan yang lebih cerdas.</p>

        <div class="login-panel-features">
            <div class="login-feature-item">
                <div class="login-feature-icon"><i class="fas fa-layer-group"></i></div>
                <span>Multi-kurikulum: Merdeka & KBC</span>
            </div>
            <div class="login-feature-item">
                <div class="login-feature-icon"><i class="fas fa-brain"></i></div>
                <span>Taksonomi Bloom (C1–C6) terintegrasi</span>
            </div>
            <div class="login-feature-item">
                <div class="login-feature-icon"><i class="fas fa-share-alt"></i></div>
                <span>Kolaborasi antar guru</span>
            </div>
            <div class="login-feature-item">
                <div class="login-feature-icon"><i class="fas fa-chart-bar"></i></div>
                <span>Analisis hasil ujian real-time</span>
            </div>
        </div>
    </div>

    <!-- Panel Kanan: Form -->
    <div class="login-form-panel">
        <!-- Dark mode toggle -->
        <div style="position:absolute; top:20px; right:20px;">
            <button type="button"
                    class="icon-button"
                    @click="toggleDark()"
                    :title="dark ? 'Mode terang' : 'Mode gelap'"
                    aria-label="Toggle dark mode">
                <i class="fas" :class="dark ? 'fa-sun' : 'fa-moon'"></i>
            </button>
        </div>

        <div class="login-form-inner">
            <div class="login-form-header">
                <h2>Selamat datang 👋</h2>
                <p class="text-muted">Masuk untuk mengelola bank soal Anda</p>
            </div>

            @if(session('error'))
                <div class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif

            @if($errors->any())
                <div class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    @foreach($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}">
                @csrf
                <div class="mb-3">
                    <label class="form-label fw-semibold" for="email">Email</label>
                    <div class="login-input-group">
                        <input type="email"
                               name="email"
                               id="email"
                               class="form-control @error('email') is-invalid @enderror"
                               value="{{ old('email') }}"
                               placeholder="nama@sekolah.com"
                               required
                               autofocus
                               autocomplete="email">
                        <span class="input-icon"><i class="fas fa-envelope"></i></span>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label fw-semibold" for="password">Password</label>
                    <div class="login-input-group" x-data="{ show: false }">
                        <input :type="show ? 'text' : 'password'"
                               name="password"
                               id="password"
                               class="form-control @error('password') is-invalid @enderror"
                               placeholder="••••••••"
                               required
                               autocomplete="current-password">
                        <button type="button"
                                class="input-icon"
                                @click="show = !show"
                                :aria-label="show ? 'Sembunyikan password' : 'Tampilkan password'">
                            <i class="fas" :class="show ? 'fa-eye-slash' : 'fa-eye'"></i>
                        </button>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check mb-0">
                        <input type="checkbox" name="remember" class="form-check-input" id="remember">
                        <label class="form-check-label text-muted" for="remember" style="font-size:13px;">Ingat saya</label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary login-btn w-100">
                    <i class="fas fa-sign-in-alt me-2"></i>Masuk
                </button>
            </form>
        </div>

        <div class="login-footer">
            Bank Soal Cerdas &copy; {{ date('Y') }} · MTs. Al-Ihsan Batujajar
        </div>
    </div>
</div>

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('loginPage', () => ({
        dark: false,
        init() {
            const saved = localStorage.getItem('theme');
            this.dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        },
        toggleDark() {
            this.dark = !this.dark;
            localStorage.setItem('theme', this.dark ? 'dark' : 'light');
        }
    }));
});
</script>

</body>
</html>