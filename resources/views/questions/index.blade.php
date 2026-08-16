@extends('layouts.app')

@section('title', 'Bank Soal')
@section('breadcrumb', 'Bank Soal')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">Daftar Soal</h5>
        <a href="{{ route('questions.create') }}" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Tambah Soal
        </a>
    </div>

    <!-- Filter Panel -->
    <div class="stat-card mb-4" x-data="questionFilter()">
        <form @submit.prevent="applyFilter()" method="GET" action="{{ route('questions.index') }}">
            <div class="row g-3 align-items-end">
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Kurikulum</label>
                    <select name="curriculum" x-model="curriculum" class="form-select form-select-sm">
                        <option value="semua">Semua</option>
                        <option value="merdeka">Merdeka</option>
                        <option value="kbc">KBC</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Level Kognitif</label>
                    <select name="level_c" x-model="level" class="form-select form-select-sm">
                        <option value="semua">Semua</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                        <option value="C3">C3</option>
                        <option value="C4">C4</option>
                        <option value="C5">C5</option>
                        <option value="C6">C6</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Tipe Soal</label>
                    <select name="type" x-model="type" class="form-select form-select-sm">
                        <option value="semua">Semua</option>
                        <option value="pg">PG</option>
                        <option value="uraian">Uraian</option>
                        <option value="menjodohkan">Menjodohkan</option>
                        <option value="benar_salah">Benar/Salah</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">KKO</label>
                    <select name="kko_id" x-model="kko" class="form-select form-select-sm">
                        <option value="semua">Semua</option>
                        @foreach($kkoList as $kko)
                            <option value="{{ $kko->id }}">{{ $kko->verb }} ({{ $kko->level }})</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Cari</label>
                    <input type="text" name="search" x-model="search" class="form-control form-control-sm" placeholder="Cari soal...">
                </div>
                <div class="col-md-2">
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary btn-sm w-100">
                            <i class="fas fa-search me-1"></i> Filter
                        </button>
                        <button type="reset" @click="resetFilter()" class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-undo"></i>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>

    <!-- Tabel Soal -->
    <div class="stat-card">
        <div class="table-responsive">
            <table class="table table-striped table-hover table-soal mb-0">
                <thead>
                    <tr>
                        <th width="50">No</th>
                        <th>Soal</th>
                        <th width="80">Tipe</th>
                        <th width="100">Kurikulum</th>
                        <th width="100">Level</th>
                        <th width="100">KKO</th>
                        <th width="80">Indikator</th>
                        <th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($questions as $index => $question)
                        <tr>
                            <td>{{ $questions->firstItem() + $index }}</td>
                            <td>
                                <div class="soal-text">{{ Str::limit($question->question_text, 100) }}</div>
                                <small class="text-muted">
                                    {{ $question->subject->name ?? '-' }} · {{ $question->jenjang }}
                                </small>
                            </td>
                            <td>
                                <span class="badge bg-secondary">
                                    @switch($question->type)
                                        @case('pg') PG @break
                                        @case('uraian') Uraian @break
                                        @case('menjodohkan') Menjodohkan @break
                                        @case('benar_salah') Benar/Salah @break
                                    @endswitch
                                </span>
                            </td>
                            <td>
                                <span class="badge {{ $question->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                    {{ $question->curriculum_label }}
                                </span>
                            </td>
                            <td>
                                <span class="badge badge-{{ strtolower($question->level_c) }}">
                                    {{ $question->level_c }}
                                </span>
                                <span class="badge {{ $question->hots_level === 'HOTS' ? 'bg-danger' : 'bg-info' }} text-white">
                                    {{ $question->hots_level }}
                                </span>
                            </td>
                            <td>{{ $question->kko->verb ?? '-' }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-info" 
                                        data-bs-toggle="tooltip" 
                                        title="{{ $question->indicator_text ?? 'Tidak ada indikator' }}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('questions.show', $question) }}" class="btn btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('questions.edit', $question) }}" class="btn btn-outline-warning">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <a href="{{ route('questions.duplicate', $question) }}" class="btn btn-outline-secondary" 
                                       onclick="return confirm('Duplikasi soal ini?')">
                                        <i class="fas fa-copy"></i>
                                    </a>
                                    <button class="btn btn-outline-danger" 
                                            onclick="if(confirm('Yakin hapus soal ini?')) document.getElementById('delete-form-{{ $question->id }}').submit()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <form id="delete-form-{{ $question->id }}" 
                                          action="{{ route('questions.destroy', $question) }}" 
                                          method="POST" class="d-none">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
                                <p class="text-muted">Belum ada soal. Klik "Tambah Soal" untuk memulai.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
                Menampilkan {{ $questions->firstItem() ?? 0 }}–{{ $questions->lastItem() ?? 0 }} dari {{ $questions->total() }} data
            </small>
            {{ $questions->appends(request()->query())->links() }}
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Tooltip
    document.addEventListener('DOMContentLoaded', function() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })
    });
</script>
@endpush