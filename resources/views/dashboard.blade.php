@extends('layouts.app')

@section('title', 'Dashboard')
@section('breadcrumb', 'Dashboard')

@section('content')
<div class="container-fluid">
    <!-- Statistik -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">Total Soal</h6>
                        <h2 class="fw-bold mb-0">{{ $totalQuestions ?? 0 }}</h2>
                        <small class="text-muted">Seluruh bank soal</small>
                    </div>
                    <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                        <i class="fas fa-database"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">Kurikulum Merdeka</h6>
                        <h2 class="fw-bold mb-0">{{ $merdekaCount ?? 0 }}</h2>
                        <small class="text-muted">
                            {{ isset($totalQuestions) && $totalQuestions > 0 ? round(($merdekaCount / $totalQuestions) * 100) : 0 }}% dari total
                        </small>
                    </div>
                    <div class="stat-icon bg-success bg-opacity-10 text-success">
                        <i class="fas fa-leaf"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">Kurikulum KBC</h6>
                        <h2 class="fw-bold mb-0">{{ $kbcCount ?? 0 }}</h2>
                        <small class="text-muted">
                            {{ isset($totalQuestions) && $totalQuestions > 0 ? round(($kbcCount / $totalQuestions) * 100) : 0 }}% dari total
                        </small>
                    </div>
                    <div class="stat-icon bg-warning bg-opacity-10 text-warning">
                        <i class="fas fa-heart"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">HOTS (C4-C6)</h6>
                        <h2 class="fw-bold mb-0">{{ $hotsCount ?? 0 }}</h2>
                        <small class="text-muted">Tingkat tinggi</small>
                    </div>
                    <div class="stat-icon bg-danger bg-opacity-10 text-danger">
                        <i class="fas fa-rocket"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Distribusi Level -->
    <div class="row g-3 mb-4">
        <div class="col-md-6">
            <div class="stat-card">
                <h6 class="fw-bold mb-3">Distribusi Level Kognitif</h6>
                <p class="text-muted small">Sebaran soal berdasarkan Taksonomi Bloom</p>
                <div class="d-flex gap-2 flex-wrap">
                    @foreach(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] as $level)
                        <div class="text-center" style="flex:1; min-width:50px;">
                            <span class="badge badge-{{ strtolower($level) }} d-block p-2 mb-1" style="font-size:14px;">
                                {{ $level }}
                            </span>
                            <span class="fw-bold">{{ $levelDistribution[$level] ?? 0 }}</span>
                            <small class="text-muted d-block">soal</small>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="stat-card">
                <h6 class="fw-bold mb-3">Ringkasan Taksonomi</h6>
                <div class="row g-2">
                    <div class="col-6">
                        <div class="p-3 bg-light rounded text-center">
                            <small class="text-muted">LOTS (C1-C3)</small>
                            <h4 class="fw-bold mb-0">
                                {{ ($levelDistribution['C1'] ?? 0) + ($levelDistribution['C2'] ?? 0) + ($levelDistribution['C3'] ?? 0) }}
                            </h4>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 bg-light rounded text-center">
                            <small class="text-muted">HOTS (C4-C6)</small>
                            <h4 class="fw-bold mb-0">
                                {{ ($levelDistribution['C4'] ?? 0) + ($levelDistribution['C5'] ?? 0) + ($levelDistribution['C6'] ?? 0) }}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Soal Terbaru -->
    <div class="row">
        <div class="col-12">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold mb-0">Soal Terbaru</h6>
                    <a href="{{ route('questions.index') }}" class="btn btn-link btn-sm text-decoration-none">
                        Lihat Semua <i class="fas fa-arrow-right ms-1"></i>
                    </a>
                </div>
                <p class="text-muted small">5 soal terakhir yang ditambahkan</p>
                
                @if(empty($recentQuestions) || $recentQuestions->isEmpty())
                    <x-empty-state
                        icon="fas fa-inbox"
                        title="Belum ada soal"
                        description="Belum ada soal yang ditambahkan baru-baru ini."
                        button-text="Tambah Soal"
                        button-href="{{ route('questions.create') }}"
                        button-class="btn btn-primary"
                    />
                @else
                    <div class="list-group list-group-flush">
                        @foreach($recentQuestions as $question)
                            <div class="list-group-item px-0 py-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p class="mb-1">{{ Str::limit($question->question_text, 100) }}</p>
                                        <div class="d-flex gap-2 flex-wrap">
                                            <span class="badge {{ $question->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                                {{ $question->curriculum_label }}
                                            </span>
                                            <span class="badge badge-{{ strtolower($question->level_c) }}">
                                                {{ $question->level_c }}
                                            </span>
                                            <span class="badge bg-secondary">
                                                {{ $question->subject->name ?? 'N/A' }}
                                            </span>
                                            <small class="text-muted">{{ $question->jenjang }}</small>
                                        </div>
                                    </div>
                                    <div class="text-end">
                                        <small class="text-muted">{{ $question->created_at->diffForHumans() }}</small>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
