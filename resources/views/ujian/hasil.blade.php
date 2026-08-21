@extends('layouts.app')

@section('title', 'Hasil Ujian')
@section('breadcrumb', 'Hasil Ujian')
@section('breadcrumb_parent', 'Ujian Saya')
@section('breadcrumb_parent_url', '{{ route(\'ujian.daftar\') }}')

@push('styles')
<style>
    .score-ring-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .score-ring-svg {
        transform: rotate(-90deg);
    }
    .score-ring-bg {
        fill: none;
        stroke: #e2e8f0;
        stroke-width: 10;
    }
    .score-ring-fill {
        fill: none;
        stroke-width: 10;
        stroke-linecap: round;
        transition: stroke-dashoffset 1s ease;
    }
    .score-ring-text {
        position: absolute;
        text-align: center;
    }
    [data-bs-theme="dark"] .score-ring-bg { stroke: #334155; }

    .hasil-stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        text-align: center;
        flex: 1;
    }
    [data-bs-theme="dark"] .hasil-stat-item {
        background: #1e293b;
        border-color: rgba(255,255,255,0.06);
    }

    .review-item {
        border-radius: 12px;
        border: 1.5px solid #e2e8f0;
        margin-bottom: 12px;
        overflow: hidden;
        transition: box-shadow 0.2s;
    }
    .review-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .review-item.correct { border-color: #86efac; }
    .review-item.wrong { border-color: #fca5a5; }
    .review-item.unanswered { border-color: #e2e8f0; }
    [data-bs-theme="dark"] .review-item { border-color: rgba(255,255,255,0.08); }
    [data-bs-theme="dark"] .review-item.correct { border-color: #166534; }
    [data-bs-theme="dark"] .review-item.wrong { border-color: #991b1b; }

    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        cursor: pointer;
        user-select: none;
        gap: 12px;
    }
    .review-header:hover { background: rgba(0,0,0,0.01); }
    .review-status-dot {
        width: 10px; height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    .review-body {
        padding: 0 18px 14px;
        border-top: 1px solid #f1f5f9;
        font-size: 14px;
    }
    [data-bs-theme="dark"] .review-body { border-top-color: rgba(255,255,255,0.05); }
</style>
@endpush

@section('content')
@php
    $totalPoin = $ujian->jawaban->sum('max_score');
    $perolehan = $ujian->total_score ?? 0;
    $persentase = $totalPoin > 0 ? round(($perolehan / $totalPoin) * 100) : 0;
    $benar = $ujian->jawaban->where('is_correct', true)->count();
    $salah = $ujian->jawaban->where('is_correct', false)->where('jawaban', '!=', null)->count();
    $totalSoal = $ujian->total_soal;

    // Warna ring berdasarkan skor
    $ringColor = $persentase >= 75 ? '#22c55e' : ($persentase >= 50 ? '#f59e0b' : '#ef4444');
    $predikat = $persentase >= 90 ? 'Sangat Baik' : ($persentase >= 75 ? 'Baik' : ($persentase >= 60 ? 'Cukup' : ($persentase >= 50 ? 'Kurang' : 'Perlu Bimbingan')));
    $circumference = 2 * M_PI * 54; // radius 54
    $offset = $circumference - ($persentase / 100) * $circumference;
@endphp

<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-xl-9">

            {{-- ===== HEADER KARTU HASIL ===== --}}
            <div class="stat-card mb-4">
                <div class="text-center mb-4">
                    <h5 class="fw-bold mb-1">{{ $ujian->title }}</h5>
                    <span class="text-muted small">{{ $ujian->paketSoal->name ?? '-' }}</span>
                    <div class="mt-1">
                        <span class="badge bg-success">Selesai</span>
                        <span class="text-muted small ms-2">
                            {{ $ujian->submitted_at?->format('d M Y, H:i') }}
                        </span>
                    </div>
                </div>

                {{-- Skor ring + stat --}}
                <div class="d-flex flex-column flex-md-row align-items-center gap-4 justify-content-center">
                    {{-- Ring --}}
                    <div class="score-ring-wrap">
                        <svg class="score-ring-svg" width="140" height="140" viewBox="0 0 140 140">
                            <circle class="score-ring-bg" cx="70" cy="70" r="54"/>
                            <circle class="score-ring-fill"
                                    cx="70" cy="70" r="54"
                                    stroke="{{ $ringColor }}"
                                    stroke-dasharray="{{ $circumference }}"
                                    stroke-dashoffset="{{ $offset }}"/>
                        </svg>
                        <div class="score-ring-text">
                            <div style="font-size:30px; font-weight:800; color:{{ $ringColor }}; line-height:1;">
                                {{ $persentase }}<span style="font-size:16px;">%</span>
                            </div>
                            <div class="text-muted" style="font-size:11px; margin-top:2px;">{{ $predikat }}</div>
                        </div>
                    </div>

                    {{-- Stat items --}}
                    <div class="d-flex flex-wrap gap-3 justify-content-center">
                        <div class="hasil-stat-item">
                            <div class="fw-bold" style="font-size:22px; color:#0f172a;">{{ $perolehan }}</div>
                            <div class="text-muted" style="font-size:12px;">Poin diperoleh</div>
                            <div class="text-muted" style="font-size:11px;">dari {{ $totalPoin }} poin</div>
                        </div>
                        <div class="hasil-stat-item">
                            <div class="fw-bold" style="font-size:22px; color:#22c55e;">{{ $benar }}</div>
                            <div class="text-muted" style="font-size:12px;">Jawaban benar</div>
                            <div class="text-muted" style="font-size:11px;">dari {{ $totalSoal }} soal</div>
                        </div>
                        <div class="hasil-stat-item">
                            <div class="fw-bold" style="font-size:22px; color:#ef4444;">{{ $totalSoal - $benar }}</div>
                            <div class="text-muted" style="font-size:12px;">Belum benar</div>
                            <div class="text-muted" style="font-size:11px;">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- ===== REVIEW PER SOAL ===== --}}
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold mb-0"><i class="fas fa-list-check me-2 text-primary"></i>Review Jawaban</h6>
                    <div class="d-flex gap-2">
                        <span class="badge" style="background:#dcfce7; color:#166534; font-size:11px;">
                            <i class="fas fa-check me-1"></i>{{ $benar }} benar
                        </span>
                        <span class="badge" style="background:#fee2e2; color:#991b1b; font-size:11px;">
                            <i class="fas fa-times me-1"></i>{{ $totalSoal - $benar }} belum benar
                        </span>
                    </div>
                </div>

                @forelse($ujian->jawaban as $index => $jawaban)
                @php
                    $q = $jawaban->question;
                    $isCorrect = $jawaban->is_correct;
                    $isUnanswered = ($q->type === 'pg' || $q->type === 'benar_salah')
                        ? $jawaban->selected_option === null
                        : empty($jawaban->jawaban);
                    $statusClass = $isUnanswered ? 'unanswered' : ($isCorrect ? 'correct' : 'wrong');
                    $dotColor = $isUnanswered ? '#94a3b8' : ($isCorrect ? '#22c55e' : '#ef4444');
                @endphp
                <div class="review-item {{ $statusClass }}" x-data="{ open: false }">
                    <div class="review-header" @click="open = !open">
                        <div class="d-flex align-items-center gap-2 flex-grow-1 min-width-0">
                            <div class="review-status-dot" style="background: {{ $dotColor }};"></div>
                            <span class="text-muted" style="font-size:12px; flex-shrink:0;">{{ $loop->iteration }}.</span>
                            <span style="font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                {{ Str::limit($q->question_text ?? '', 90) }}
                            </span>
                        </div>
                        <div class="d-flex align-items-center gap-2 flex-shrink-0">
                            <span class="badge"
                                style="font-size:11px; background:{{ $isUnanswered ? '#f1f5f9' : ($isCorrect ? '#dcfce7' : '#fee2e2') }}; color:{{ $isUnanswered ? '#64748b' : ($isCorrect ? '#166534' : '#991b1b') }};">
                                {{ $jawaban->score }}/{{ $jawaban->max_score }}
                            </span>
                            @if(!$isUnanswered && $q->type === 'pg')
                                <span class="badge" style="font-size:11px; background:{{ $isCorrect ? '#dcfce7' : '#fee2e2' }}; color:{{ $isCorrect ? '#166534' : '#991b1b' }};">
                                    {{ $isCorrect ? '✓ Benar' : '✗ Salah' }}
                                </span>
                            @endif
                            <i class="fas fa-chevron-down text-muted" style="font-size:11px; transition:transform 0.2s;" :style="open ? 'transform:rotate(180deg)' : ''"></i>
                        </div>
                    </div>

                    <div class="review-body" x-show="open" x-collapse.duration.150ms>
                        {{-- Teks soal lengkap --}}
                        <div class="mb-3 p-3 rounded" style="background:#f8fafc; font-size:13px; line-height:1.6;">
                            {{ $q->question_text ?? '-' }}
                        </div>

                        {{-- Jawaban siswa --}}
                        <div class="mb-2">
                            <div class="fw-semibold mb-1" style="font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:#64748b;">Jawaban Anda</div>
                            <div class="p-2 rounded" style="background: {{ $isUnanswered ? '#f8fafc' : ($isCorrect ? '#f0fdf4' : '#fef2f2') }}; font-size:13px; border: 1px solid {{ $isUnanswered ? '#e2e8f0' : ($isCorrect ? '#bbf7d0' : '#fecaca') }};">
                                @if($isUnanswered)
                                    <span class="text-muted"><i class="fas fa-minus me-1"></i>Tidak dijawab</span>
                                @elseif($q->type === 'pg')
                                    @php $selectedOpt = $q->pgOptions->get($jawaban->selected_option); @endphp
                                    {{ $selectedOpt ? $selectedOpt->label . '. ' . $selectedOpt->option_text : '—' }}
                                @elseif($q->type === 'benar_salah')
                                    {{ $jawaban->selected_option !== null ? ($jawaban->selected_option ? 'Benar' : 'Salah') : '—' }}
                                @else
                                    {{ $jawaban->jawaban ?: '—' }}
                                @endif
                            </div>
                        </div>

                        {{-- Jawaban benar (hanya untuk PG yang salah) --}}
                        @if(!$isCorrect && !$isUnanswered && $q->type === 'pg')
                            @php $correctOpt = $q->pgOptions->where('is_correct', true)->first(); @endphp
                            <div>
                                <div class="fw-semibold mb-1" style="font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:#64748b;">Jawaban yang Benar</div>
                                <div class="p-2 rounded" style="background:#f0fdf4; border:1px solid #bbf7d0; font-size:13px; color:#166534;">
                                    <i class="fas fa-check me-1"></i>
                                    {{ $correctOpt ? $correctOpt->label . '. ' . $correctOpt->option_text : '—' }}
                                </div>
                            </div>
                        @endif

                        @if($q->type === 'uraian' || $q->type === 'menjodohkan')
                            <div class="mt-2">
                                <span class="badge bg-warning text-dark" style="font-size:11px;">
                                    <i class="fas fa-clock me-1"></i>Menunggu koreksi guru
                                </span>
                            </div>
                        @endif
                    </div>
                </div>
                @empty
                    <x-empty-state
                        icon="fas fa-clipboard-check"
                        title="Belum ada jawaban"
                        description="Siswa menyelesaikan ujian tanpa menjawab soal apapun."
                    />
                @endforelse
            </div>

            <div class="mt-4 text-center">
                <a href="{{ route('ujian.daftar') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-1"></i> Kembali ke Daftar Ujian
                </a>
            </div>

        </div>
    </div>
</div>
@endsection
