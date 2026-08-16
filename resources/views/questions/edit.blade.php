@extends('layouts.app')

@section('title', 'Edit Soal')
@section('breadcrumb', 'Edit Soal')

@section('content')
<div class="container-fluid">
    <div class="stat-card" x-data="questionForm()">
        <h5 class="fw-bold mb-4">Edit Soal</h5>
        
        <form action="{{ route('questions.update', $question) }}" method="POST">
            @csrf
            @method('PUT')
            
            <!-- Sama seperti create, tapi dengan nilai old/current -->
            <!-- Bagian 1: Tipe Soal -->
            <div class="mb-4">
                <label class="form-label fw-bold">Tipe Soal <span class="text-danger">*</span></label>
                <div class="row g-2">
                    <div class="col-md-3">
                        <div class="type-selector-card {{ $question->type === 'pg' ? 'active' : '' }}" @click="type = 'pg'">
                            <i class="fas fa-list-ul"></i>
                            <span class="d-block fw-bold">PG</span>
                            <small class="text-muted">Pilihan Ganda</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="type-selector-card {{ $question->type === 'uraian' ? 'active' : '' }}" @click="type = 'uraian'">
                            <i class="fas fa-pen"></i>
                            <span class="d-block fw-bold">Uraian</span>
                            <small class="text-muted">Essay / Uraian</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="type-selector-card {{ $question->type === 'menjodohkan' ? 'active' : '' }}" @click="type = 'menjodohkan'">
                            <i class="fas fa-link"></i>
                            <span class="d-block fw-bold">Menjodohkan</span>
                            <small class="text-muted">Pasangan</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="type-selector-card {{ $question->type === 'benar_salah' ? 'active' : '' }}" @click="type = 'benar_salah'">
                            <i class="fas fa-check-circle"></i>
                            <span class="d-block fw-bold">Benar/Salah</span>
                            <small class="text-muted">True/False</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Bagian 2: Informasi Dasar -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <label class="form-label fw-bold">Mata Pelajaran <span class="text-danger">*</span></label>
                    <select name="subject_id" class="form-select @error('subject_id') is-invalid @enderror" required>
                        <option value="">Pilih Mata Pelajaran</option>
                        @foreach($subjects as $subject)
                            <option value="{{ $subject->id }}" {{ old('subject_id', $question->subject_id) == $subject->id ? 'selected' : '' }}>
                                {{ $subject->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Jenjang <span class="text-danger">*</span></label>
                    <select name="jenjang" class="form-select @error('jenjang') is-invalid @enderror" required>
                        <option value="">Pilih Jenjang</option>
                        <option value="SD" {{ old('jenjang', $question->jenjang) == 'SD' ? 'selected' : '' }}>SD</option>
                        <option value="SMP" {{ old('jenjang', $question->jenjang) == 'SMP' ? 'selected' : '' }}>SMP</option>
                        <option value="SMA" {{ old('jenjang', $question->jenjang) == 'SMA' ? 'selected' : '' }}>SMA</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Kurikulum <span class="text-danger">*</span></label>
                    <select name="curriculum" class="form-select @error('curriculum') is-invalid @enderror" required>
                        <option value="">Pilih Kurikulum</option>
                        <option value="merdeka" {{ old('curriculum', $question->curriculum) == 'merdeka' ? 'selected' : '' }}>Merdeka</option>
                        <option value="kbc" {{ old('curriculum', $question->curriculum) == 'kbc' ? 'selected' : '' }}>KBC</option>
                        <option value="both" {{ old('curriculum', $question->curriculum) == 'both' ? 'selected' : '' }}>Merdeka & KBC</option>
                    </select>
                </div>
            </div>
            
            <!-- Bagian 3: Taksonomi -->
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Level Kognitif <span class="text-danger">*</span></label>
                    <select name="level_c" class="form-select @error('level_c') is-invalid @enderror" 
                            x-model="level" @change="loadKKO(level)" required>
                        <option value="">Pilih Level</option>
                        <option value="C1" {{ old('level_c', $question->level_c) == 'C1' ? 'selected' : '' }}>C1 - Mengingat</option>
                        <option value="C2" {{ old('level_c', $question->level_c) == 'C2' ? 'selected' : '' }}>C2 - Memahami</option>
                        <option value="C3" {{ old('level_c', $question->level_c) == 'C3' ? 'selected' : '' }}>C3 - Menerapkan</option>
                        <option value="C4" {{ old('level_c', $question->level_c) == 'C4' ? 'selected' : '' }}>C4 - Menganalisis</option>
                        <option value="C5" {{ old('level_c', $question->level_c) == 'C5' ? 'selected' : '' }}>C5 - Mengevaluasi</option>
                        <option value="C6" {{ old('level_c', $question->level_c) == 'C6' ? 'selected' : '' }}>C6 - Mencipta</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">KKO <span class="text-danger">*</span></label>
                    <select name="kko_id" class="form-select @error('kko_id') is-invalid @enderror" required>
                        <option value="">Pilih KKO</option>
                        @foreach($kkoList as $kko)
                            <option value="{{ $kko->id }}" {{ old('kko_id', $question->kko_id) == $kko->id ? 'selected' : '' }}>
                                {{ $kko->verb }} ({{ $kko->level }})
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>
            
            <!-- Bagian 4: Teks Soal -->
            <div class="mb-3">
                <label class="form-label fw-bold">Teks Soal <span class="text-danger">*</span></label>
                <textarea name="question_text" class="form-control @error('question_text') is-invalid @enderror" 
                          rows="4" required>{{ old('question_text', $question->question_text) }}</textarea>
            </div>
            
            <!-- Bagian 5: Area Jawaban -->
            <div class="mb-3">
                <label class="form-label fw-bold">Area Jawaban</label>
                
                <!-- PG -->
                <div x-show="isPG">
                    <div class="alert alert-info">Klik radio untuk menandai jawaban benar.</div>
                    @php
                        $pgOptions = $question->pgOptions ?? collect();
                    @endphp
                    @foreach(['A', 'B', 'C', 'D', 'E'] as $label)
                        @php $option = $pgOptions->where('label', $label)->first(); @endphp
                        <div class="input-group mb-2">
                            <span class="input-group-text">
                                <input type="radio" name="correct_option" value="{{ $loop->index }}" 
                                       {{ $option && $option->is_correct ? 'checked' : '' }}>
                            </span>
                            <input type="text" name="options[{{ $loop->index }}]" class="form-control" 
                                   placeholder="Pilihan {{ $label }}" 
                                   value="{{ old('options.' . $loop->index, $option->option_text ?? '') }}">
                        </div>
                    @endforeach
                </div>
                
                <!-- Uraian -->
                <div x-show="isUraian">
                    <textarea name="rubric_text" class="form-control" rows="3" 
                              placeholder="Kunci Jawaban / Rubrik Penilaian">{{ old('rubric_text', $question->essayRubric->rubric_text ?? '') }}</textarea>
                </div>
                
                <!-- Menjodohkan -->
                <div x-show="isMenjodohkan">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Pernyataan</th>
                                    <th>Pasangan Jawaban</th>
                                    <th>Hapus</th>
                                </tr>
                            </thead>
                            <tbody>
                                @php $pairs = $question->matchingPairs ?? collect(); @endphp
                                @foreach($pairs as $index => $pair)
                                    <tr>
                                        <td>{{ $loop->iteration }}</td>
                                        <td>
                                            <input type="text" name="left_texts[{{ $index }}]" class="form-control form-control-sm" 
                                                   value="{{ old('left_texts.' . $index, $pair->left_text) }}">
                                        </td>
                                        <td>
                                            <input type="text" name="right_texts[{{ $index }}]" class="form-control form-control-sm" 
                                                   value="{{ old('right_texts.' . $index, $pair->right_text) }}">
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-outline-danger" 
                                                    @click="matchingPairs.splice({{ $index }}, 1)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary" @click="addPair()">
                        <i class="fas fa-plus"></i> Tambah Baris
                    </button>
                </div>
                
                <!-- Benar/Salah -->
                <div x-show="isBenarSalah">
                    <div class="d-flex gap-3">
                        <button type="button" class="btn btn-lg btn-success px-4" 
                                :class="{ 'active': correctBoolean === true }" 
                                @click="correctBoolean = true">
                            <i class="fas fa-check me-2"></i> Benar
                        </button>
                        <button type="button" class="btn btn-lg btn-danger px-4" 
                                :class="{ 'active': correctBoolean === false }" 
                                @click="correctBoolean = false">
                            <i class="fas fa-times me-2"></i> Salah
                        </button>
                        <input type="hidden" name="correct_boolean" :value="correctBoolean">
                    </div>
                </div>
            </div>
            
            <!-- Bagian 6: Indikator Soal -->
            <div class="mb-3">
                <label class="form-label fw-bold">Indikator Soal</label>
                <textarea name="indicator_text" class="form-control" rows="2" 
                          placeholder="Kompetensi yang diukur...">{{ old('indicator_text', $question->indicator_text) }}</textarea>
            </div>
            
            <!-- Bagian 7: Tombol Aksi -->
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Update Soal
                </button>
                <a href="{{ route('questions.index') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection