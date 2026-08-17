@extends('layouts.app')

@section('title', 'Kerjakan Ujian')
@section('breadcrumb', 'Kerjakan Ujian')

@push('styles')
<style>
    /* Mode layar penuh */
    #ujian-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        z-index: 9999;
        padding: 20px;
        overflow-y: auto;
    }

    [data-bs-theme="dark"] #ujian-container {
        background: #1e1e2a;
    }

    /* Peringatan saat keluar dari ujian */
    #warning-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
    }

    #warning-overlay.show {
        display: flex;
    }

    #warning-overlay .card {
        max-width: 500px;
        animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-20px); }
        75% { transform: translateX(20px); }
    }

    /* Larangan copy-paste */
    .no-select {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    /* Timer warning */
    .timer-warning {
        color: #dc3545;
        animation: blink 1s ease-in-out infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
</style>
@endpush

@section('content')
<!-- Warning Overlay -->
<div id="warning-overlay">
    <div class="card">
        <div class="card-header bg-danger text-white">
            <h5 class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i> PERINGATAN!</h5>
        </div>
        <div class="card-body text-center">
            <p class="fw-bold">Anda keluar dari halaman ujian!</p>
            <p class="text-muted">Anda akan diberikan peringatan. Jika keluar 3 kali, ujian akan otomatis berakhir.</p>
            <div class="mt-3">
                <span class="badge bg-danger p-2" id="warning-count">Peringatan: 0/3</span>
            </div>
            <button class="btn btn-primary mt-3" onclick="closeWarning()">
                <i class="fas fa-arrow-left me-1"></i> Kembali ke Ujian
            </button>
        </div>
    </div>
</div>


<div id="ujian-container">
    <script>
        // Data ujian untuk aplikasi Alpine (aman: bukan di dalam atribut HTML)
        window.__ujianData = @json($questionsPayload);
        window.__ujianDeadline = {{ $deadline ?? 'null' }};
        window.__ujianId = {{ $ujian->id }};
    </script>
    <div class="stat-card" x-data="ujianApp(window.__ujianData || [], window.__ujianDeadline, window.__ujianId)">
        <!-- Header Ujian -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h5 class="fw-bold mb-0">{{ $ujian->title }}</h5>
                <small class="text-muted">Soal <span x-text="currentIndex + 1"></span> dari {{ $ujian->total_soal }}</small>
            </div>
            <div class="text-end">
                <div class="fw-bold" x-show="deadline" :class="{'timer-warning': timeLeft < 60}">
                    <i class="fas fa-clock me-1"></i><span x-text="formatTime(timeLeft)"></span>
                </div>
                <small class="text-muted" x-show="!deadline">Waktu tidak terbatas</small>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="d-flex align-items-center gap-2 mb-4">
            <div class="progress flex-grow-1" style="height: 8px;">
                <div class="progress-bar bg-primary" role="progressbar" :style="'width: ' + progress + '%'" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small class="text-muted">Terjawab <span x-text="progress"></span>%</small>
        </div>

        <!-- Soal -->
        <div class="mb-4">
            <h6 class="fw-bold">Soal <span x-text="currentIndex + 1"></span></h6>
            <div class="p-3 bg-light rounded" x-text="currentQuestion ? currentQuestion.question_text : ''"></div>

            <!-- Jawaban -->
            <div class="mt-3">
                <template x-if="currentQuestion && currentQuestion.type === 'pg'">
                    <div>
                        <template x-for="(option, idx) in currentQuestion.options" :key="idx">
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio"
                                       :name="'question_' + currentQuestion.id"
                                       :value="idx"
                                       x-model="jawaban[currentQuestion.id].selected_option"
                                       @change="saveJawaban()">
                                <label class="form-check-label">
                                    <strong><span x-text="option.label"></span>.</strong> <span x-text="option.option_text"></span>
                                </label>
                            </div>
                        </template>
                    </div>
                </template>

                <template x-if="currentQuestion && currentQuestion.type === 'benar_salah'">
                    <div class="d-flex gap-3">
                        <button type="button" class="btn btn-lg btn-success px-4"
                                @click="selectBoolean(1)"
                                :class="{'active': jawaban[currentQuestion.id].selected_option === 1}">
                            <i class="fas fa-check me-2"></i> Benar
                        </button>
                        <button type="button" class="btn btn-lg btn-danger px-4"
                                @click="selectBoolean(0)"
                                :class="{'active': jawaban[currentQuestion.id].selected_option === 0}">
                            <i class="fas fa-times me-2"></i> Salah
                        </button>
                    </div>
                </template>

                <template x-if="currentQuestion && currentQuestion.type === 'uraian'">
                    <textarea class="form-control" rows="4"
                              placeholder="Tulis jawaban Anda di sini..."
                              x-model="jawaban[currentQuestion.id].jawaban"
                              @input="saveJawaban()"></textarea>
                </template>

                <template x-if="currentQuestion && currentQuestion.type === 'menjodohkan'">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Pernyataan</th>
                                    <th>Pasangan Jawaban</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template x-for="pair in currentQuestion.pairs" :key="pair.id">
                                    <tr>
                                        <td x-text="pair.left_text"></td>
                                        <td>
                                            <input type="text" class="form-control form-control-sm"
                                                   placeholder="Tulis pasangan..."
                                                   x-model="jawaban[currentQuestion.id].jawaban[pair.id]"
                                                   @input="saveJawaban()">
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </template>
            </div>
        </div>

        <!-- Navigasi -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="previousQuestion()" :disabled="currentIndex === 0">
                <i class="fas fa-arrow-left me-1"></i> Sebelumnya
            </button>

            <div class="d-flex flex-wrap justify-content-center gap-1">
                <template x-for="(q, idx) in questions" :key="q.id">
                    <button type="button" class="btn btn-sm"
                            :class="isAnswered(q) ? 'btn-success' : 'btn-outline-secondary'"
                            @click="goToQuestion(idx)">
                        <span x-text="idx + 1"></span>
                    </button>
                </template>
            </div>

            <div>
                <button type="button" class="btn btn-outline-primary" @click="nextQuestion()" x-show="currentIndex < questions.length - 1">
                    Selanjutnya <i class="fas fa-arrow-right ms-1"></i>
                </button>
                <button type="button" class="btn btn-success" @click="submit()" x-show="currentIndex === questions.length - 1">
                    <i class="fas fa-check me-1"></i> Submit Ujian
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
// ============ KEAMANAN UJIAN ============

(function() {
    'use strict';

    let warningCount = 0;
    const MAX_WARNING = 3;

    // ===== 1. MODE LAYAR PENUH =====
    function enableFullscreen() {
        const container = document.getElementById('ujian-container');
        if (container && !document.fullscreenElement) {
            container.requestFullscreen?.().catch?.(() => {});
        }
    }

    // ===== 2. DETEKSI TAB SWITCH =====
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            warningCount++;
            showWarning();

            if (warningCount >= MAX_WARNING) {
                showToast('Ujian Berakhir', 'Anda telah keluar dari ujian sebanyak 3 kali. Ujian akan otomatis disubmit.', 'danger');
                submitUjian(true);
            }
        }
    });

    // ===== 3. DETEKSI BLUR (Keluar dari Window) =====
    window.addEventListener('blur', function() {
        warningCount++;
        showWarning();

        if (warningCount >= MAX_WARNING) {
            showToast('Ujian Berakhir', 'Anda telah keluar dari ujian sebanyak 3 kali. Ujian akan otomatis disubmit.', 'danger');
            submitUjian(true);
        }
    });

    // ===== 4. TAMPILKAN PERINGATAN =====
    function showWarning() {
        const overlay = document.getElementById('warning-overlay');
        if (overlay) {
            overlay.classList.add('show');
            document.getElementById('warning-count').textContent =
                `Peringatan: ${warningCount}/${MAX_WARNING}`;
        }
    }

    function closeWarning() {
        const overlay = document.getElementById('warning-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // ===== 5. LARANGAN COPY-PASTE =====
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showToast('Peringatan', 'Copy-paste tidak diizinkan selama ujian!', 'warning');
        return false;
    });

    document.addEventListener('paste', function(e) {
        e.preventDefault();
        showToast('Peringatan', 'Copy-paste tidak diizinkan selama ujian!', 'warning');
        return false;
    });

    document.addEventListener('cut', function(e) {
        e.preventDefault();
        showToast('Peringatan', 'Cut tidak diizinkan selama ujian!', 'warning');
        return false;
    });

    // ===== 6. LARANGAN KLIK KANAN =====
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showToast('Peringatan', 'Klik kanan tidak diizinkan selama ujian!', 'warning');
        return false;
    });

    // ===== 7. LARANGAN DRAG =====
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    // ===== 8. LARANGAN SELECT TEXT =====
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            return false;
        }
    });

    // ===== 9. DETEKSI FULLSCREEN EXIT =====
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
            warningCount++;
            showWarning();

            if (warningCount >= MAX_WARNING) {
                showToast('Ujian Berakhir', 'Anda keluar dari mode layar penuh. Ujian akan otomatis disubmit.', 'danger');
                submitUjian(true);
            }
        }
    });

    // ===== 10. TOAST NOTIFICATION =====
    function showToast(title, message, type = 'warning') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 999999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.innerHTML = `
            <strong>${title}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // ===== 11. SUBMIT UJIAN =====
    async function submitUjian(force = false) {
        // Simpan jawaban terakhir dulu sebelum submit
        if (window.__ujianState && typeof window.__ujianState.flush === 'function') {
            try {
                await window.__ujianState.flush();
            } catch (e) {
                showToast('Gagal', 'Gagal menyimpan jawaban terakhir.', 'danger');
            }
        }

        if (force) {
            doSubmitUjian();
            return;
        }

        // Konfirmasi pakai modal kustom (bukan confirm() native)
        window.confirmDialog?.({
            title: 'Submit Ujian',
            message: 'Yakin ingin submit ujian? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Submit',
            onConfirm: doSubmitUjian,
        });
    }

    function doSubmitUjian() {
        fetch('{{ route("ujian.submit", $ujian->id) }}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            }
        }).then((res) => {
            if (res.ok) {
                window.location.href = '{{ route("ujian.hasil", $ujian->id) }}';
            } else {
                res.json().then((data) => {
                    showToast('Gagal', data.error || 'Gagal submit ujian.', 'danger');
                }).catch(() => {
                    showToast('Gagal', 'Gagal submit ujian.', 'danger');
                });
            }
        });
    }

    // ===== 12. INISIALISASI =====
    document.addEventListener('DOMContentLoaded', function() {
        enableFullscreen();

        // Cegah keluar dengan tombol ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.fullscreenElement) {
                e.preventDefault();
                return false;
            }
        });

        // Cegah F12 (Developer Tools)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12') {
                e.preventDefault();
                showToast('Peringatan', 'Developer Tools tidak diizinkan!', 'danger');
                return false;
            }
        });

        // Cegah Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                showToast('Peringatan', 'View source tidak diizinkan!', 'danger');
                return false;
            }
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) {
                e.preventDefault();
                showToast('Peringatan', 'Developer Tools tidak diizinkan!', 'danger');
                return false;
            }
        });
    });

    // Expose fungsi untuk Alpine.js
    window.closeWarning = closeWarning;
    window.submitUjian = submitUjian;

})();
</script>
@endpush
