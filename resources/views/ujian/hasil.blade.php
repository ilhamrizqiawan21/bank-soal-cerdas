@extends('layouts.app')

@section('title', 'Hasil Ujian')
@section('breadcrumb', 'Hasil Ujian')

@section('content')
<div class="container-fluid">
    <div class="stat-card text-center">
        <div class="mb-4">
            <h5 class="fw-bold">{{ $ujian->title }}</h5>
            <p class="text-muted">{{ $ujian->paketSoal->name ?? '-' }}</p>
        </div>
        
        <!-- Skor -->
        <div class="row justify-content-center mb-4">
            <div class="col-md-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h6 class="text-white-50">Nilai Anda</h6>
                        <h2 class="fw-bold">{{ $ujian->total_score ?? 0 }}</h2>
                        <small>dari {{ $ujian->jawaban->sum('max_score') }} poin</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h6 class="text-white-50">Jawaban Benar</h6>
                        <h2 class="fw-bold">{{ $ujian->jawaban->where('is_correct', true)->count() }}</h2>
                        <small>dari {{ $ujian->total_soal }} soal</small>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Detail Jawaban -->
        <div class="text-start mt-4">
            <h6 class="fw-bold mb-3">Review Jawaban</h6>
            @if($ujian->jawaban->isEmpty())
                <x-empty-state
                    icon="fas fa-clipboard-check"
                    title="Belum ada jawaban"
                    description="Siswa menyelesaikan ujian tanpa menjawab soal apapun."
                />
            @else
            @foreach($ujian->jawaban as $index => $jawaban)
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>Soal {{ $loop->iteration }}</strong>
                                <p class="mb-1">{{ Str::limit($jawaban->question->question_text ?? '', 100) }}</p>
                                <div>
                                    <span class="badge {{ $jawaban->is_correct ? 'bg-success' : 'bg-danger' }}">
                                        <i class="fas {{ $jawaban->is_correct ? 'fa-check' : 'fa-times' }} me-1"></i>{{ $jawaban->is_correct ? 'Benar' : 'Salah' }}
                                    </span>
                                    <small class="text-muted ms-2">Skor: {{ $jawaban->score }} / {{ $jawaban->max_score }}</small>
                                </div>
                            </div>
                            <div class="text-end">
                                <button class="btn btn-sm btn-outline-info" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target="#detail-{{ $jawaban->id }}">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="collapse mt-2" id="detail-{{ $jawaban->id }}">
                            <div class="bg-light p-2 rounded">
                                <strong>Jawaban Anda:</strong>
                                @if($jawaban->question->type === 'pg')
                                    {{ $jawaban->selected_option !== null ? $jawaban->question->pgOptions[$jawaban->selected_option]->option_text ?? '-' : 'Tidak dijawab' }}
                                @elseif($jawaban->question->type === 'benar_salah')
                                    {{ $jawaban->selected_option !== null ? ($jawaban->selected_option ? 'Benar' : 'Salah') : 'Tidak dijawab' }}
                                @else
                                    {{ $jawaban->jawaban ?? 'Tidak dijawab' }}
                                @endif
                                
                                @if(!$jawaban->is_correct && $jawaban->question->type === 'pg')
                                    <div class="mt-1">
                                        <strong>Jawaban yang benar:</strong>
                                        {{ $jawaban->question->pgOptions->where('is_correct', true)->first()->option_text ?? '-' }}
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
            @endif
        </div>
        
        <div class="mt-4">
            <a href="{{ route('ujian.daftar') }}" class="btn btn-primary">
                <i class="fas fa-arrow-left me-1"></i> Kembali ke Daftar Ujian
            </a>
        </div>
    </div>
</div>
@endsection
