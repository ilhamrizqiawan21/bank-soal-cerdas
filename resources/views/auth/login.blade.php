<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Bank Soal Cerdas</title>
    <link rel="icon" type="image/png" href="{{ asset('images/android-chrome-512x512.png') }}">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #f6f8fb;
            color: #102033;
        }

        .login-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 32px 18px;
        }

        .login-card {
            width: min(100%, 420px);
            background: #ffffff;
            border: 1px solid #dbe3ee;
            border-radius: 8px;
            box-shadow: 0 18px 55px rgba(15, 35, 60, 0.08);
            padding: 34px;
        }

        .brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 28px;
        }

        .brand img {
            width: 92px;
            height: 92px;
            object-fit: contain;
            margin-bottom: 14px;
        }

        .brand h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: 0;
        }

        .brand p {
            margin: 8px 0 0;
            color: #64748b;
            font-size: 14px;
            line-height: 1.5;
        }

        .alert {
            margin-bottom: 16px;
            border-radius: 6px;
            padding: 12px 14px;
            border: 1px solid transparent;
            font-size: 14px;
            line-height: 1.45;
        }

        .alert-danger {
            background: #fff1f2;
            border-color: #fecdd3;
            color: #9f1239;
        }

        .alert-warning {
            background: #fffbeb;
            border-color: #fde68a;
            color: #92400e;
        }

        .field {
            margin-bottom: 16px;
        }

        label {
            display: block;
            margin-bottom: 7px;
            font-size: 13px;
            font-weight: 700;
            color: #334155;
        }

        input[type="email"],
        input[type="password"],
        input[type="text"] {
            width: 100%;
            height: 46px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 12px;
            font: inherit;
            font-size: 15px;
            color: #102033;
            background: #ffffff;
        }

        input:focus {
            border-color: #2563eb;
            outline: 3px solid rgba(37, 99, 235, 0.14);
        }

        .password-field {
            position: relative;
        }

        .password-field input {
            padding-right: 76px;
        }

        .password-toggle {
            position: absolute;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
            border: 0;
            background: transparent;
            color: #2563eb;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            padding: 7px;
        }

        .row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin: 2px 0 22px;
            color: #64748b;
            font-size: 14px;
        }

        .remember {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .remember input {
            width: 16px;
            height: 16px;
            accent-color: #2563eb;
        }

        .submit {
            width: 100%;
            height: 46px;
            border: 0;
            border-radius: 6px;
            background: #2563eb;
            color: #ffffff;
            font: inherit;
            font-size: 15px;
            font-weight: 800;
            cursor: pointer;
        }

        .submit:hover {
            background: #1d4ed8;
        }

        .footer {
            margin-top: 22px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 28px 22px;
            }
        }
    </style>
</head>
<body>
    <main class="login-page">
        <section class="login-card" aria-labelledby="login-title">
            <div class="brand">
                <img src="{{ asset('images/android-chrome-512x512.png') }}" alt="Bank Soal Cerdas">
                <h1 id="login-title">Bank Soal Cerdas</h1>
                <p>Masuk untuk mengelola bank soal dan ujian.</p>
            </div>

            @if(session('error'))
                <div class="alert alert-danger" role="alert">{{ session('error') }}</div>
            @endif

            @if(request()->boolean('session_expired'))
                <div class="alert alert-warning" role="alert">
                    Sesi login Anda sudah berakhir. Silakan masuk kembali.
                </div>
            @endif

            @if($errors->any())
                <div class="alert alert-danger" role="alert">
                    @foreach($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}">
                @csrf

                <div class="field">
                    <label for="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value="{{ old('email') }}"
                        autocomplete="email"
                        placeholder="nama@sekolah.com"
                        required
                        autofocus
                    >
                </div>

                <div class="field">
                    <label for="password">Password</label>
                    <div class="password-field">
                        <input
                            type="password"
                            name="password"
                            id="password"
                            autocomplete="current-password"
                            placeholder="Masukkan password"
                            required
                        >
                        <button type="button" class="password-toggle" id="password-toggle">Lihat</button>
                    </div>
                </div>

                <div class="row">
                    <label class="remember" for="remember">
                        <input type="checkbox" name="remember" id="remember">
                        Ingat saya
                    </label>
                </div>

                <button type="submit" class="submit">Masuk</button>
            </form>

            <div class="footer">
                MTs. Al-Ihsan Batujajar
            </div>
        </section>
    </main>

    <script>
        (() => {
            const password = document.getElementById('password');
            const toggle = document.getElementById('password-toggle');

            if (!password || !toggle) return;

            toggle.addEventListener('click', () => {
                const visible = password.type === 'text';
                password.type = visible ? 'password' : 'text';
                toggle.textContent = visible ? 'Lihat' : 'Sembunyikan';
            });
        })();
    </script>
</body>
</html>
