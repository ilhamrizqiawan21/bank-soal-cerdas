<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\PaketSoalController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Auth
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Bank Soal (CRUD + Duplicate + Export/Import)
    Route::resource('questions', QuestionController::class);
    Route::get('/questions/{question}/duplicate', [QuestionController::class, 'duplicate'])->name('questions.duplicate');
    Route::get('/questions/export', [QuestionController::class, 'export'])->name('questions.export');
    Route::post('/questions/import', [QuestionController::class, 'import'])->name('questions.import');
    
    // Paket Soal
    Route::resource('paket-soal', PaketSoalController::class);
    Route::get('/paket-soal/{paketSoal}/duplicate', [PaketSoalController::class, 'duplicate'])->name('paket-soal.duplicate');
    Route::get('/api/paket-soal/questions', [PaketSoalController::class, 'getQuestions'])->name('api.paket-soal.questions');
    
    // Pengaturan
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
});