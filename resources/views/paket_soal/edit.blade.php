@extends('layouts.app')

@section('title', 'Edit Paket Soal')
@section('breadcrumb', 'Edit Paket Soal')
@section('breadcrumb_parent', 'Paket Soal')
@section('breadcrumb_parent_url', '{{ route(\'paket-soal.index\') }}')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Edit Paket Soal</h5>
        
        <form action="{{ route('paket-soal.update', $paketSoal) }}" method="POST" id="paketForm">
            @csrf
            @method('PUT')
            
            <!-- Informasi Paket -->
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Nama Paket <span class="text-danger">*</span></label>
                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" 
                           value="{{ old('name', $paketSoal->name) }}" required>
                    @error('name')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Durasi (Menit)</label>
                    <input type="number" name="duration_minutes" class="form-control @error('duration_minutes') is-invalid @enderror" 
                           value="{{ old('duration_minutes', $paketSoal->duration_minutes) }}" min="1" max="180">
                    @error('duration_minutes')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-4">
                    <label class="form-label fw-bold">Jenjang <span class="text-danger">*</span></label>
                    <select name="jenjang" class="form-select @error('jenjang') is-invalid @enderror" required>
                        <option value="">Pilih Jenjang</option>
                        <option value="SD" {{ old('jenjang', $paketSoal->jenjang) == 'SD' ? 'selected' : '' }}>SD</option>
                        <option value="SMP" {{ old('jenjang', $paketSoal->jenjang) == 'SMP' ? 'selected' : '' }}>SMP</option>
                        <option value="SMA" {{ old('jenjang', $paketSoal->jenjang) == 'SMA' ? 'selected' : '' }}>SMA</option>
                    </select>
                    @error('jenjang')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Kurikulum <span class="text-danger">*</span></label>
                    <select name="curriculum" class="form-select @error('curriculum') is-invalid @enderror" required>
                        <option value="">Pilih Kurikulum</option>
                        <option value="merdeka" {{ old('curriculum', $paketSoal->curriculum) == 'merdeka' ? 'selected' : '' }}>Merdeka</option>
                        <option value="kbc" {{ old('curriculum', $paketSoal->curriculum) == 'kbc' ? 'selected' : '' }}>KBC</option>
                        <option value="both" {{ old('curriculum', $paketSoal->curriculum) == 'both' ? 'selected' : '' }}>Merdeka & KBC</option>
                    </select>
                    @error('curriculum')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Status</label>
                    <select name="status" class="form-select">
                        <option value="draft" {{ old('status', $paketSoal->status) == 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status', $paketSoal->status) == 'published' ? 'selected' : '' }}>Published</option>
                        <option value="archived" {{ old('status', $paketSoal->status) == 'archived' ? 'selected' : '' }}>Archived</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label fw-bold">Deskripsi</label>
                <textarea name="description" class="form-control @error('description') is-invalid @enderror" 
                          rows="2">{{ old('description', $paketSoal->description) }}</textarea>
                @error('description')
                    <small class="text-danger">{{ $message }}</small>
                @enderror
            </div>
            
            <hr>
            
            <!-- Pilih Soal -->
            <div class="mb-3">
                <label class="form-label fw-bold">Pilih Soal <span class="text-danger">*</span></label>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> Pilih minimal 1 soal untuk dimasukkan ke paket.
                </div>
                
                <div class="table-responsive">
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th width="50"><input type="checkbox" id="selectAll"></th>
                                <th>Soal</th>
                                <th width="120">Mapel</th>
                                <th width="100">Level</th>
                                <th width="100">KKO</th>
                                <th width="80">Skor</th>
                            </tr>
                        </thead>
                        <tbody>
                            @php $selectedIds = $paketSoal->items->pluck('question_id')->toArray(); @endphp
                            @forelse($questions as $question)
                                @php $item = $paketSoal->items->where('question_id', $question->id)->first(); @endphp
                                <tr>
                                    <td class="text-center">
                                        <input type="checkbox" name="questions[]" value="{{ $question->id }}" 
                                               class="question-checkbox" 
                                               {{ in_array($question->id, $selectedIds) ? 'checked' : '' }}>
                                    </td>
                                    <td>
                                        <div>{{ Str::limit($question->question_text, 100) }}</div>
                                        <small class="text-muted">
                                            <span class="badge {{ $question->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                                {{ $question->curriculum_label }}
                                            </span>
                                            <span class="badge badge-{{ strtolower($question->level_c) }}">
                                                {{ $question->level_c }}
                                            </span>
                                            <span class="badge {{ $question->type === 'pg' ? 'bg-primary' : 'bg-secondary' }}">
                                                {{ $question->type_label }}
                                            </span>
                                        </small>
                                    </td>
                                    <td>{{ $question->subject->name ?? '-' }}</td>
                                    <td>
                                        <span class="badge badge-{{ strtolower($question->level_c) }}">
                                            {{ $question->level_c }}
                                        </span>
                                    </td>
                                    <td>{{ $question->kko->verb ?? '-' }}</td>
                                    <td>
                                        <input type="number" name="scores[]" class="form-control form-control-sm" 
                                               value="{{ $item->score ?? 1 }}" min="1" max="100" style="width:70px">
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center py-3 text-muted">
                                        Belum ada soal. <a href="{{ route('questions.create') }}">Buat soal</a> terlebih dahulu.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @error('questions')
                    <small class="text-danger">{{ $message }}</small>
                @enderror
            </div>
            
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Update Paket
                </button>
                <a href="{{ route('paket-soal.index') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
