<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request)
    {
        if (Auth::check()) {
            return redirect()->intended('/app/dashboard');
        }

        $intended = $request->query('intended');
        if (is_string($intended) && str_starts_with($intended, '/') && ! str_starts_with($intended, '//')) {
            $request->session()->put('url.intended', $intended);
        }

        return view('auth.login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            if (! Auth::user()->is_active) {
                Auth::logout();

                return back()->withErrors([
                    'email' => 'Akun Anda dinonaktifkan. Hubungi administrator.',
                ])->onlyInput('email');
            }

            $request->session()->regenerate();

            return redirect()->intended('/app/dashboard');
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
