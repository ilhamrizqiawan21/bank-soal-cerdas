@extends('layouts.app')

@section('title', 'Detail Soal')
@section('breadcrumb', 'Detail Soal')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Soal</h5>
            <div>
                <a href="{{ route('questions.edit', $question) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit me-1"></i> Edit
                </a>
                <a href="{{ route('questions.index') }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left me-1"></i> Kembali
                </a>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="mb-3">
                    <label class="fw-bold text-muted small">Teks Soal</label>
                    <p class="p-3 bg-light rounded">{{ $question->question_text }}</p>
                </div>
                
                <div class="mb-3">
                    <label class="fw-bold text-muted small">Jawaban</label>
                    <div class="p-3 bg-light rounded">
                        @switch($question->type)
                            @case('pg')
                                @foreach($question->pgOptions as $option)
                                    <div class="mb-1">
                                        <strong>{{ $option->label }}.</strong> {{ $option->option_text }}
                                        @if($option->is_correct)
                                            <span class="badge bg-success">✓ Benar</span>
                                        @endif
                                    </div>
                                @endforeach
                                @break
                            @case('uraian')
                                {{ $question->essayRubric->rubric_text ?? 'Tidak ada rubrik' }}
                                @break
                            @case('menjodohkan')
                                <table class="table table-sm table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Pernyataan</th>
                                            <th>Pasangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($question->matchingPairs as $pair)
                                            <tr>
                                                <td>{{ $pair->left_text }}</td>
                                                <td>{{ $pair->right_text }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                                @break
                            @case('benar_salah')
                                <span class="badge {{ $question->correct_boolean ? 'bg-success' : 'bg-danger' }} p-2">
                                    {{ $question->correct_boolean ? 'Benar' : 'Salah' }}
                                </span>
                                @break
                        @endswitch
                    </div>
                </div>
                
                @if($question->indicator_text)
                    <div class="mb-3">
                        <label class="fw-bold text-muted small">Indikator Soal</label>
                        <p class="p-3 bg-light rounded">{{ $question->indicator_text }}</p>
                    </div>
                @endif
            </div>
            
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="fw-bold">Informasi Soal</h6>
                        <hr>
                        <div class="mb-2">
                            <small class="text-muted">Mata Pelajaran</small>
                            <div class="fw-bold">{{ $question->subject->name ?? '-' }}</div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Jenjang</small>
                            <div class="fw-bold">{{ $question->jenjang }}</div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Kurikulum</small>
                            <div>
                                <span class="badge {{ $question->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                    {{ $question->curriculum_label }}
                                </span>
                            </div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Tipe Soal</small>
                            <div class="fw-bold">{{ ucfirst($question->type) }}</div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Level Kognitif</small>
                            <div>
                                <span class="badge badge-{{ strtolower($question->level_c) }}">
                                    {{ $question->level_c }}
                                </span>
                                <span class="badge {{ $question->hots_level === 'HOTS' ? 'bg-danger' : 'bg-info' }} text-white">
                                    {{ $question->hots_level }}
                                </span>
                            </div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">KKO</small>
                            <div class="fw-bold">{{ $question->kko->verb ?? '-' }}</div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Dibuat oleh</small>
                            <div class="fw-bold">{{ $question->creator->name ?? '-' }}</div>
                        </div>
                        <div>
                            <small class="text-muted">Dibuat pada</small>
                            <div class="fw-bold">{{ $question->created_at->format('d M Y H:i') }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection