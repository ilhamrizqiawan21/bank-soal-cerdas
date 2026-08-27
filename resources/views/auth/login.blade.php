<!DOCTYPE html>
<html lang="id" id="login-html">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Bank Soal Cerdas</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <style>
        * {
            box-sizing: border-box;
        }

        /* ===== LOGIN PAGE ===== */
        #login-html, #login-html body {
            height: 100%;
        }

        body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #f8fafc;
            color: #0f172a;
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
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 0;
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
            font-weight: 800;
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

        .form-label {
            display: inline-block;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 700;
            color: #334155;
        }

        .login-input-group .form-control {
            width: 100%;
            height: 48px;
            border-radius: 10px;
            border: 1.5px solid #e2e8f0;
            padding: 0 44px 0 14px;
            font-size: 14px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            background: #fff;
            color: #0f172a;
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
            width: 100%;
            height: 48px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.01em;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            border: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px rgba(59,130,246,0.3);
            color: #fff;
            cursor: pointer;
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

        .mb-3 { margin-bottom: 16px; }
        .mb-4 { margin-bottom: 24px; }
        .mb-0 { margin-bottom: 0; }
        .fw-semibold { font-weight: 600; }
        .w-100 { width: 100%; }
        .text-muted { color: #64748b; }
        .d-flex { display: flex; }
        .justify-content-between { justify-content: space-between; }
        .align-items-center { align-items: center; }
        .form-check { display: flex; align-items: center; gap: 8px; }
        .form-check-input { width: 16px; height: 16px; accent-color: #2563eb; }
        .form-check-label { font-size: 13px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; border: 0; }
        .btn-primary { color: #fff; }

        .icon-button {
            width: 40px;
            height: 40px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #fff;
            color: #334155;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        }

        .alert {
            position: relative;
            margin-bottom: 16px;
            padding: 12px 40px 12px 14px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.5;
            border: 1px solid transparent;
        }

        .alert-danger {
            background: #fef2f2;
            border-color: #fecaca;
            color: #991b1b;
        }

        .alert-warning {
            background: #fffbeb;
            border-color: #fde68a;
            color: #92400e;
        }

        .alert-close {
            position: absolute;
            top: 9px;
            right: 10px;
            border: 0;
            background: transparent;
            color: currentColor;
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
        }

        :focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
        }

        /* Dark mode untuk form panel */
        html.dark .login-form-panel {
            background: #0f172a;
        }

        html.dark .login-form-header h2,
        html.dark .form-label {
            color: #f1f5f9;
        }

        html.dark .login-input-group .form-control {
            background: #1e293b;
            border-color: rgba(255,255,255,0.1);
            color: #e2e8f0;
        }

        html.dark .login-input-group .form-control:focus {
            border-color: #3b82f6;
            background: #1e293b;
        }

        html.dark body,
        html.dark .login-form-panel {
            background: #0f172a;
        }

        html.dark .icon-button {
            background: #1e293b;
            border-color: #334155;
            color: #e2e8f0;
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
<body>

<div class="login-shell">
    <!-- Panel Kiri: Branding -->
    <div class="login-panel">
        <div class="login-panel-logo">
            BS
        </div>
        <h1>Bank Soal Cerdas</h1>
        <p>Platform pengelolaan soal ujian berbasis kurikulum untuk pendidikan yang lebih cerdas.</p>

        <div class="login-panel-features">
            <div class="login-feature-item">
                <div class="login-feature-icon">K</div>
                <span>Multi-kurikulum: Merdeka & KBC</span>
            </div>
            <div class="login-feature-item">
                <div class="login-feature-icon">B</div>
                <span>Taksonomi Bloom (C1–C6) terintegrasi</span>
            </div>
            <div class="login-feature-item">
                <div class="login-feature-icon">S</div>
                <span>Kolaborasi antar guru</span>
            </div>
            <div class="login-feature-item">
                <div class="login-feature-icon">A</div>
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
                    id="theme-toggle"
                    title="Mode gelap"
                    aria-label="Aktifkan atau nonaktifkan mode gelap">
                <span id="theme-toggle-icon">D</span>
            </button>
        </div>

        <div class="login-form-inner">
            <div class="login-form-header">
                <h2>Selamat datang 👋</h2>
                <p class="text-muted">Masuk untuk mengelola bank soal Anda</p>
            </div>

            @if(session('error'))
                <div class="alert alert-danger" role="alert">
                    {{ session('error') }}
                    <button type="button" class="alert-close" data-close-alert aria-label="Tutup pesan">&times;</button>
                </div>
            @endif

            @if(request()->boolean('session_expired'))
                <div class="alert alert-warning" role="alert">
                    Sesi login Anda sudah berakhir. Silakan masuk kembali untuk melanjutkan.
                    <button type="button" class="alert-close" data-close-alert aria-label="Tutup pesan">&times;</button>
                </div>
            @endif

            @if($errors->any())
                <div class="alert alert-danger" role="alert">
                    @foreach($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                    <button type="button" class="alert-close" data-close-alert aria-label="Tutup pesan">&times;</button>
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
                        <span class="input-icon" aria-hidden="true">@</span>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label fw-semibold" for="password">Password</label>
                    <div class="login-input-group">
                        <input type="password"
                               name="password"
                               id="password"
                               class="form-control @error('password') is-invalid @enderror"
                               placeholder="••••••••"
                               required
                               autocomplete="current-password">
                        <button type="button"
                                class="input-icon"
                                id="password-toggle"
                                aria-label="Tampilkan password">
                            <span aria-hidden="true">Show</span>
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
                    Masuk
                </button>
            </form>
        </div>

        <div class="login-footer">
            Bank Soal Cerdas &copy; {{ date('Y') }} · MTs. Al-Ihsan Batujajar
        </div>
    </div>
</div>

<script>
    (() => {
        const root = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-toggle-icon');
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.getElementById('password-toggle');

        const applyTheme = (theme) => {
            root.classList.toggle('dark', theme === 'dark');
            localStorage.setItem('cbt_app_theme', theme);
            if (themeToggle && themeIcon) {
                themeToggle.title = theme === 'dark' ? 'Mode terang' : 'Mode gelap';
                themeIcon.textContent = theme === 'dark' ? 'L' : 'D';
            }
        };

        const savedTheme = localStorage.getItem('cbt_app_theme');
        applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light');

        themeToggle?.addEventListener('click', () => {
            applyTheme(root.classList.contains('dark') ? 'light' : 'dark');
        });

        passwordToggle?.addEventListener('click', () => {
            if (!passwordInput) return;
            const isVisible = passwordInput.type === 'text';
            passwordInput.type = isVisible ? 'password' : 'text';
            passwordToggle.setAttribute('aria-label', isVisible ? 'Tampilkan password' : 'Sembunyikan password');
            passwordToggle.textContent = isVisible ? 'Show' : 'Hide';
        });

        document.querySelectorAll('[data-close-alert]').forEach((button) => {
            button.addEventListener('click', () => button.closest('.alert')?.remove());
        });
    })();
</script>
</body>
</html>
