<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\PaketSoalController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UjianController;
use App\Http\Controllers\AnalisisController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () { return redirect()->route('dashboard'); });
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:5,1');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/questions/export', [QuestionController::class, 'export'])->name('questions.export')->middleware('role:admin,guru');
    Route::get('/questions/{question}/duplicate', [QuestionController::class, 'duplicate'])->name('questions.duplicate')->middleware('role:admin,guru');
    Route::resource('questions', QuestionController::class)->middleware('role:admin,guru');
    Route::post('/questions/import', [QuestionController::class, 'import'])->name('questions.import')->middleware('role:admin,guru');

    // Mata Pelajaran
    Route::resource('subjects', SubjectController::class)->middleware('role:admin,guru');

    Route::resource('paket-soal', PaketSoalController::class)->middleware('role:admin,guru');
    Route::get('/paket-soal/{paketSoal}/duplicate', [PaketSoalController::class, 'duplicate'])->name('paket-soal.duplicate')->middleware('role:admin,guru');
    Route::get('/api/paket-soal/questions', [PaketSoalController::class, 'getQuestions'])->name('api.paket-soal.questions')->middleware('role:admin,guru');

    Route::resource('users', UserController::class)->middleware('role:admin');
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status')->middleware('role:admin');

    Route::get('/profile', [UserController::class, 'profile'])->name('users.profile');
    Route::put('/profile', [UserController::class, 'updateProfile'])->name('users.profile.update');
    Route::put('/profile/avatar', [UserController::class, 'updateAvatar'])->name('users.avatar');
    Route::get('/settings', fn () => redirect()->route('users.profile'))->name('settings.index');
    Route::put('/settings/password', [UserController::class, 'updatePassword'])->name('settings.password');

    Route::resource('ujian', UjianController::class)->middleware('role:admin,guru');
    Route::post('/ujian/{ujian}/publish', [UjianController::class, 'publish'])->name('ujian.publish')->middleware('role:admin,guru');
    Route::get('/ujian-saya', [UjianController::class, 'daftarUjian'])->name('ujian.daftar')->middleware('role:siswa');
    Route::get('/ujian/{id}/kerjakan', [UjianController::class, 'kerjakan'])->name('ujian.kerjakan')->middleware('role:siswa');
    Route::post('/ujian/{id}/jawaban', [UjianController::class, 'submitJawaban'])->name('ujian.jawaban')->middleware('role:siswa');
    Route::post('/ujian/{id}/submit', [UjianController::class, 'submitUjian'])->name('ujian.submit')->middleware('role:siswa');
    Route::get('/ujian/{id}/hasil', [UjianController::class, 'hasil'])->name('ujian.hasil')->middleware('role:siswa');

    Route::get('/analisis', [AnalisisController::class, 'index'])->name('analisis.index')->middleware('role:admin,guru');
    Route::get('/analisis/ujian/{id}', [AnalisisController::class, 'ujianDetail'])->name('analisis.ujian')->middleware('role:admin,guru');
    Route::get('/analisis/siswa/{id}', [AnalisisController::class, 'siswaDetail'])->name('analisis.siswa')->middleware('role:admin,guru');
    Route::get('/analisis/export', [AnalisisController::class, 'export'])->name('analisis.export')->middleware('role:admin,guru');

    Route::resource('kategori', KategoriController::class)->middleware('role:admin,guru');
    Route::resource('tag', TagController::class)->middleware('role:admin,guru');

    Route::get('/api/kko/{level}', function (string $level) {
        return response()->json([
            'success' => true,
            'data' => \App\Models\KkoMaster::where('level', $level)
                ->orderBy('bloom_level')
                ->orderBy('verb')
                ->get(['id', 'verb', 'level', 'bloom_level', 'description']),
        ]);
    })->name('api.kko.by-level');

    Route::get('/share', [ShareController::class, 'index'])->name('share.index');
    Route::get('/share/riwayat', [ShareController::class, 'riwayat'])->name('share.riwayat');
    Route::get('/share/detail/{type}/{id}', [ShareController::class, 'detail'])->name('share.detail');
    Route::post('/share/soal/{id}', [ShareController::class, 'shareSoal'])->name('share.soal');
    Route::post('/share/soal/{id}/accept', [ShareController::class, 'acceptSoal'])->name('share.soal.accept');
    Route::post('/share/soal/{id}/reject', [ShareController::class, 'rejectSoal'])->name('share.soal.reject');
    Route::post('/share/paket/{id}', [ShareController::class, 'sharePaket'])->name('share.paket');
    Route::post('/share/paket/{id}/accept', [ShareController::class, 'acceptPaket'])->name('share.paket.accept');
    Route::post('/share/paket/{id}/reject', [ShareController::class, 'rejectPaket'])->name('share.paket.reject');
});
