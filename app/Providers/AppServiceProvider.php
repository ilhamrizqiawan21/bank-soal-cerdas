<?php

namespace App\Providers;

use App\Models\ShareSoal;
use App\Models\SharePaket;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Notifikasi undangan share (soal/paket) untuk topbar
        View::composer('layouts.app', function ($view) {
            $user = auth()->user();
            $pendingShares = collect();

            if ($user) {
                $shares = ShareSoal::with('sharedBy')
                    ->where('shared_to', $user->id)
                    ->where('is_accepted', false)
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(fn ($s) => (object) [
                        'id' => $s->id,
                        'message' => ($s->sharedBy->name ?? 'Guru') . ' membagikan soal kepada Anda',
                        'accept' => route('share.soal.accept', $s->id),
                        'reject' => route('share.soal.reject', $s->id),
                        'created_at' => $s->created_at,
                    ]);

                $paketShares = SharePaket::with('sharedBy')
                    ->where('shared_to', $user->id)
                    ->where('is_accepted', false)
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(fn ($s) => (object) [
                        'id' => $s->id,
                        'message' => ($s->sharedBy->name ?? 'Guru') . ' membagikan paket soal kepada Anda',
                        'accept' => route('share.paket.accept', $s->id),
                        'reject' => route('share.paket.reject', $s->id),
                        'created_at' => $s->created_at,
                    ]);

                $pendingShares = $shares->concat($paketShares)
                    ->sortByDesc('created_at')
                    ->take(8)
                    ->values();
            }

            $view->with('pendingShares', $pendingShares);
        });
    }
}
