@extends('layouts.app')

@section('title', 'Kerjakan Ujian')
@section('breadcrumb', 'Kerjakan Ujian')
@section('breadcrumb_parent', 'Ujian Saya')
@section('breadcrumb_parent_url', '{{ route(\'ujian.daftar\') }}')

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


<div id="ujian-container" data-ujian-id="{{ $ujian->id }}" data-deadline="{{ $deadline ?? '' }}" data-submit-url="{{ route('ujian.submit', $ujian->id) }}" data-result-url="{{ route('ujian.hasil', $ujian->id) }}">
    {{-- Payload untuk Alpine (dibaca oleh resources/js/pages/ujian-kerjakan.js) --}}
    <script type="application/json" id="ujian-data">@json($questionsPayload)</script>
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
            <div class="p-3 bg-light rounded" x-html="currentQuestion ? currentQuestion.question_text : ''"></div>

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

        <!-- Panel Nomor Soal (collapsible di mobile) -->
        <div class="mb-3" x-data="{ panelOpen: window.innerWidth > 576 }">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted fw-bold">
                    <i class="fas fa-th me-1"></i> Navigasi Soal
                    <span class="ms-2">
                        <span class="badge bg-success">✓ Dijawab</span>
                        <span class="badge bg-outline-secondary border ms-1">○ Belum</span>
                    </span>
                </small>
                <!-- Toggle hanya muncul di layar kecil -->
                <button type="button" class="btn btn-sm btn-outline-secondary d-md-none"
                        @click="panelOpen = !panelOpen">
                    <i class="fas" :class="panelOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    <span x-text="panelOpen ? 'Sembunyikan' : 'Tampilkan Nomor'"></span>
                </button>
            </div>
            <div x-show="panelOpen" x-collapse.duration.200ms>
                <div class="d-flex flex-wrap gap-1 p-2 border rounded" style="max-height: 120px; overflow-y: auto;">
                    <template x-for="(q, idx) in questions" :key="q.id">
                        <button type="button" class="btn btn-sm"
                                :class="{
                                    'btn-success': isAnswered(q) && currentIndex !== idx,
                                    'btn-primary': currentIndex === idx,
                                    'btn-outline-secondary': !isAnswered(q) && currentIndex !== idx
                                }"
                                @click="goToQuestion(idx)"
                                :title="'Soal ' + (idx + 1) + (isAnswered(q) ? ' (sudah dijawab)' : ' (belum dijawab)')">
                            <span x-text="idx + 1"></span>
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <!-- Navigasi Sebelumnya / Selanjutnya -->
        <div class="d-flex justify-content-between align-items-center gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="previousQuestion()" :disabled="currentIndex === 0">
                <i class="fas fa-arrow-left me-1"></i> Sebelumnya
            </button>
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

