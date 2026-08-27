<?php

use App\Http\Controllers\AnalisisController;
use App\Http\Controllers\Api\AnalisisController as ApiAnalisisController;
use App\Http\Controllers\Api\DashboardController as ApiDashboardController;
use App\Http\Controllers\Api\KategoriController as ApiKategoriController;
use App\Http\Controllers\Api\KkoController as ApiKkoController;
use App\Http\Controllers\Api\MeController as ApiMeController;
use App\Http\Controllers\Api\PaketSoalController as ApiPaketSoalController;
use App\Http\Controllers\Api\QuestionController as ApiQuestionController;
use App\Http\Controllers\Api\ShareController as ApiShareController;
use App\Http\Controllers\Api\SubjectController as ApiSubjectController;
use App\Http\Controllers\Api\TagController as ApiTagController;
use App\Http\Controllers\Api\UjianController as ApiUjianController;
use App\Http\Controllers\Api\UserController as ApiUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\PaketSoalController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UjianController;
use App\Http\Controllers\UserController;
use App\Models\KkoMaster;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\Ujian;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('spa');
});
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:5,1');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::middleware(['auth'])->group(function () {
    // React SPA shell (strangler-pattern entry point).
    Route::view('/app', 'spa')->name('spa');
    Route::view('/app/{any}', 'spa')->where('any', '.*')->name('spa.fallback');

    $legacyAppRedirect = static fn (string $path) => static fn () => redirect()->to($path);

    // JSON API consumed by the SPA (session + CSRF via web group).
    Route::prefix('api')->group(function () {
        Route::get('/me', [ApiMeController::class, 'show']);
        Route::put('/profile', [ApiMeController::class, 'updateProfile']);
        Route::post('/profile/avatar', [ApiMeController::class, 'updateAvatar']);
        Route::put('/profile/avatar', [ApiMeController::class, 'updateAvatar']);
        Route::put('/settings/password', [ApiMeController::class, 'updatePassword']);
        Route::get('/dashboard', [ApiDashboardController::class, 'show']);
        Route::get('/ujian/{ujian}', [ApiUjianController::class, 'show'])->name('api.ujian.show');

        Route::middleware('role:admin,guru')->group(function () {
            Route::get('/users/options', [ApiUserController::class, 'options']);

            Route::get('/subjects', [ApiSubjectController::class, 'index']);
            Route::post('/subjects', [ApiSubjectController::class, 'store']);
            Route::put('/subjects/{subject}', [ApiSubjectController::class, 'update']);
            Route::delete('/subjects/{subject}', [ApiSubjectController::class, 'destroy']);

            Route::get('/kategori', [ApiKategoriController::class, 'index']);
            Route::post('/kategori', [ApiKategoriController::class, 'store']);
            Route::put('/kategori/{kategori}', [ApiKategoriController::class, 'update']);
            Route::delete('/kategori/{kategori}', [ApiKategoriController::class, 'destroy']);

            Route::get('/kko', [ApiKkoController::class, 'index']);

            Route::get('/questions/export', [ApiQuestionController::class, 'export']);
            Route::post('/questions/import', [ApiQuestionController::class, 'import']);
            Route::post('/questions/{question}/duplicate', [ApiQuestionController::class, 'duplicate'])->name('api.questions.duplicate');
            Route::apiResource('questions', ApiQuestionController::class)->names('api.questions');

            Route::get('/paket-soal/questions', [PaketSoalController::class, 'getQuestions'])->name('api.paket-soal.questions');
            Route::post('/paket-soal/{paketSoal}/duplicate', [ApiPaketSoalController::class, 'duplicate'])->name('api.paket-soal.duplicate');
            Route::apiResource('paket-soal', ApiPaketSoalController::class)
                ->parameters(['paket-soal' => 'paketSoal'])
                ->names('api.paket-soal');

            Route::post('/ujian/{ujian}/publish', [ApiUjianController::class, 'publish'])->name('api.ujian.publish');
            Route::apiResource('ujian', ApiUjianController::class)->except(['show'])->names('api.ujian');

            Route::get('/share', [ApiShareController::class, 'index']);
            Route::post('/share', [ApiShareController::class, 'store']);
            Route::get('/share/{share}', [ApiShareController::class, 'show']);
            Route::put('/share/{share}', [ApiShareController::class, 'update']);
            Route::delete('/share/{share}', [ApiShareController::class, 'destroy']);
            Route::post('/share/{share}/accept', [ApiShareController::class, 'accept']);
            Route::post('/share/{share}/reject', [ApiShareController::class, 'reject']);
            Route::post('/share/{share}/notes', [ApiShareController::class, 'addNote']);

            Route::get('/analisis', [ApiAnalisisController::class, 'index']);
            Route::get('/analisis/export', [ApiAnalisisController::class, 'export']);
            Route::get('/analisis/ujian/{ujian}', [ApiAnalisisController::class, 'ujian']);
            Route::get('/analisis/siswa/{siswa}', [ApiAnalisisController::class, 'siswa']);

            Route::get('/tags', [ApiTagController::class, 'index']);
            Route::post('/tags', [ApiTagController::class, 'store']);
            Route::put('/tags/{tag}', [ApiTagController::class, 'update']);
            Route::delete('/tags/{tag}', [ApiTagController::class, 'destroy']);
        });

        Route::middleware('role:admin')->group(function () {
            Route::post('/users/{user}/toggle-status', [ApiUserController::class, 'toggleStatus']);
            Route::apiResource('users', ApiUserController::class)->names('api.users');
        });

        Route::middleware('role:siswa')->group(function () {
            Route::get('/ujian-saya', [ApiUjianController::class, 'mine']);
            Route::post('/ujian/{ujian}/jawaban', [ApiUjianController::class, 'answer']);
            Route::post('/ujian/{ujian}/submit', [ApiUjianController::class, 'submit']);
        });
    });

    Route::get('/dashboard', $legacyAppRedirect('/app/dashboard'))->name('dashboard');

    Route::get('/questions/export', [QuestionController::class, 'export'])->name('questions.export')->middleware('role:admin,guru');
    Route::post('/questions/{question}/duplicate', [QuestionController::class, 'duplicate'])->name('questions.duplicate')->middleware('role:admin,guru');
    Route::get('/questions', $legacyAppRedirect('/app/questions'))->name('questions.index')->middleware('role:admin,guru');
    Route::get('/questions/create', $legacyAppRedirect('/app/questions/create'))->name('questions.create')->middleware('role:admin,guru');
    Route::get('/questions/{question}/edit', function (Question $question) {
        Gate::authorize('update', $question);

        return redirect()->to("/app/questions/{$question->id}/edit");
    })->name('questions.edit')->middleware('role:admin,guru');
    Route::get('/questions/{question}', function (Question $question) {
        Gate::authorize('view', $question);

        return redirect()->to("/app/questions/{$question->id}");
    })->name('questions.show')->middleware('role:admin,guru');
    Route::resource('questions', QuestionController::class)->except(['index', 'create', 'show', 'edit'])->middleware('role:admin,guru');
    Route::post('/questions/import', [QuestionController::class, 'import'])->name('questions.import')->middleware('role:admin,guru');

    // Mata Pelajaran
    Route::get('/subjects', $legacyAppRedirect('/app/subjects'))->name('subjects.index')->middleware('role:admin,guru');
    Route::get('/subjects/create', $legacyAppRedirect('/app/subjects'))->name('subjects.create')->middleware('role:admin,guru');
    Route::get('/subjects/{subject}/edit', $legacyAppRedirect('/app/subjects'))->name('subjects.edit')->middleware('role:admin,guru');
    Route::get('/subjects/{subject}', $legacyAppRedirect('/app/subjects'))->name('subjects.show')->middleware('role:admin,guru');
    Route::resource('subjects', SubjectController::class)->except(['index', 'create', 'show', 'edit'])->middleware('role:admin,guru');

    Route::get('/paket-soal', $legacyAppRedirect('/app/paket-soal'))->name('paket-soal.index')->middleware('role:admin,guru');
    Route::get('/paket-soal/create', $legacyAppRedirect('/app/paket-soal/create'))->name('paket-soal.create')->middleware('role:admin,guru');
    Route::get('/paket-soal/{paketSoal}/edit', function (PaketSoal $paketSoal) {
        Gate::authorize('update', $paketSoal);

        return redirect()->to("/app/paket-soal/{$paketSoal->id}/edit");
    })->name('paket-soal.edit')->middleware('role:admin,guru');
    Route::get('/paket-soal/{paketSoal}', function (PaketSoal $paketSoal) {
        Gate::authorize('view', $paketSoal);

        return redirect()->to("/app/paket-soal/{$paketSoal->id}");
    })->name('paket-soal.show')->middleware('role:admin,guru');
    Route::resource('paket-soal', PaketSoalController::class)->except(['index', 'create', 'show', 'edit'])->middleware('role:admin,guru');
    Route::post('/paket-soal/{paketSoal}/duplicate', [PaketSoalController::class, 'duplicate'])->name('paket-soal.duplicate')->middleware('role:admin,guru');
    Route::get('/users', $legacyAppRedirect('/app/users'))->name('users.index')->middleware('role:admin');
    Route::get('/users/create', $legacyAppRedirect('/app/users'))->name('users.create')->middleware('role:admin');
    Route::get('/users/{user}/edit', $legacyAppRedirect('/app/users'))->name('users.edit')->middleware('role:admin');
    Route::get('/users/{user}', $legacyAppRedirect('/app/users'))->name('users.show')->middleware('role:admin');
    Route::resource('users', UserController::class)->except(['index', 'create', 'show', 'edit'])->middleware('role:admin');
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status')->middleware('role:admin');

    Route::get('/profile', $legacyAppRedirect('/app/profile'))->name('users.profile');
    Route::put('/profile', [UserController::class, 'updateProfile'])->name('users.profile.update');
    Route::put('/profile/avatar', [UserController::class, 'updateAvatar'])->name('users.avatar');
    Route::get('/settings', $legacyAppRedirect('/app/profile'))->name('settings.index');
    Route::put('/settings/password', [UserController::class, 'updatePassword'])->name('settings.password');

    Route::get('/ujian', $legacyAppRedirect('/app/ujian'))->name('ujian.index')->middleware('role:admin,guru');
    Route::get('/ujian/create', $legacyAppRedirect('/app/ujian'))->name('ujian.create')->middleware('role:admin,guru');
    Route::get('/ujian/{ujian}/edit', function (Ujian $ujian) {
        Gate::authorize('update', $ujian);

        return redirect()->to("/app/ujian/{$ujian->id}");
    })->name('ujian.edit')->middleware('role:admin,guru');
    Route::get('/ujian/{ujian}', function (Ujian $ujian) {
        Gate::authorize('view', $ujian);

        return redirect()->to("/app/ujian/{$ujian->id}");
    })->name('ujian.show')->middleware('role:admin,guru');
    Route::resource('ujian', UjianController::class)->except(['index', 'create', 'show', 'edit'])->middleware('role:admin,guru');
    Route::post('/ujian/{ujian}/publish', [UjianController::class, 'publish'])->name('ujian.publish')->middleware('role:admin,guru');
    Route::get('/ujian-saya', $legacyAppRedirect('/app/ujian-saya'))->name('ujian.daftar')->middleware('role:siswa');
    Route::get('/ujian/{ujian}/kerjakan', function (Ujian $ujian) {
        Gate::authorize('view', $ujian);

        return redirect()->to("/app/ujian/{$ujian->id}/kerjakan");
    })->name('ujian.kerjakan')->middleware('role:siswa');
    Route::post('/ujian/{id}/jawaban', [UjianController::class, 'submitJawaban'])->name('ujian.jawaban')->middleware('role:siswa');
    Route::post('/ujian/{id}/submit', [UjianController::class, 'submitUjian'])->name('ujian.submit')->middleware('role:siswa');
    Route::get('/ujian/{ujian}/hasil', function (Ujian $ujian) {
        Gate::authorize('view', $ujian);

        return redirect()->to("/app/ujian/{$ujian->id}/hasil");
    })->name('ujian.hasil')->middleware('role:siswa');

    Route::get('/analisis', $legacyAppRedirect('/app/analisis'))->name('analisis.index')->middleware('role:admin,guru');
    Route::get('/analisis/ujian/{ujian}', function (Ujian $ujian) {
        Gate::authorize('view', $ujian);

        return redirect()->to('/app/analisis');
    })->name('analisis.ujian')->middleware('role:admin,guru');
    Route::get('/analisis/siswa/{id}', $legacyAppRedirect('/app/analisis'))->name('analisis.siswa')->middleware('role:admin,guru');
    Route::get('/analisis/export', [AnalisisController::class, 'export'])->name('analisis.export')->middleware('role:admin,guru');

    Route::get('/kategori', $legacyAppRedirect('/app/kategori'))->name('kategori.index')->middleware('role:admin,guru');
    Route::get('/kategori/create', $legacyAppRedirect('/app/kategori'))->name('kategori.create')->middleware('role:admin,guru');
    Route::get('/kategori/{kategori}/edit', $legacyAppRedirect('/app/kategori'))->name('kategori.edit')->middleware('role:admin,guru');
    Route::get('/kategori/{kategori}', $legacyAppRedirect('/app/kategori'))->name('kategori.show')->middleware('role:admin,guru');
    Route::resource('kategori', KategoriController::class)->except(['index', 'create', 'show', 'edit'])->middleware('role:admin,guru');
    Route::get('/tag', $legacyAppRedirect('/app/tags'))->name('tag.index')->middleware('role:admin,guru');
    Route::get('/tag/create', $legacyAppRedirect('/app/tags'))->name('tag.create')->middleware('role:admin,guru');
    Route::get('/tag/{tag}/edit', $legacyAppRedirect('/app/tags'))->name('tag.edit')->middleware('role:admin,guru');
    Route::get('/tag/{tag}', $legacyAppRedirect('/app/tags'))->name('tag.show')->middleware('role:admin,guru');
    Route::resource('tag', TagController::class)->except(['index', 'create', 'show', 'edit'])->middleware('role:admin,guru');

    Route::get('/api/kko/{level}', function (string $level) {
        return response()->json([
            'success' => true,
            'data' => KkoMaster::where('level', $level)
                ->orderBy('bloom_level')
                ->orderBy('verb')
                ->get(['id', 'verb', 'level', 'bloom_level', 'description']),
        ]);
    })->name('api.kko.by-level');

    Route::get('/share', $legacyAppRedirect('/app/share'))->name('share.index');
    Route::get('/share/riwayat', $legacyAppRedirect('/app/share'))->name('share.riwayat');
    Route::get('/share/detail/{type}/{id}', [ShareController::class, 'detail'])->name('share.detail');
    Route::post('/share/soal/{id}', [ShareController::class, 'shareSoal'])->name('share.soal');
    Route::post('/share/soal/{id}/accept', [ShareController::class, 'acceptSoal'])->name('share.soal.accept');
    Route::post('/share/soal/{id}/reject', [ShareController::class, 'rejectSoal'])->name('share.soal.reject');
    Route::post('/share/paket/{id}', [ShareController::class, 'sharePaket'])->name('share.paket');
    Route::post('/share/paket/{id}/accept', [ShareController::class, 'acceptPaket'])->name('share.paket.accept');
    Route::post('/share/paket/{id}/reject', [ShareController::class, 'rejectPaket'])->name('share.paket.reject');
});
