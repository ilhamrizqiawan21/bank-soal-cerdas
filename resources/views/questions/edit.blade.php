@extends('layouts.app')

@section('title', 'Edit Soal')
@section('breadcrumb', 'Edit Soal')
@section('breadcrumb_parent', 'Bank Soal')
@section('breadcrumb_parent_url', '{{ route(\'questions.index\') }}')

@section('content')
@php
    $pgLabels = ['A', 'B', 'C', 'D', 'E'];
    $pgOptionValues = array_values(array_filter(
        array_map(function ($label) use ($question) {
            return $question->pgOptions->firstWhere('label', $label)?->option_text ?? '';
        }, $pgLabels),
        fn ($value) => $value !== ''
    ));

    if (count($pgOptionValues) < 4) {
        $pgOptionValues = array_pad($pgOptionValues, 4, '');
    }

    $correctOptionIndex = collect($pgLabels)->search(function ($label) use ($question) {
        return (bool) ($question->pgOptions->firstWhere('label', $label)?->is_correct ?? false);
    }, false);
    $correctOptionIndex = $correctOptionIndex === false ? 0 : $correctOptionIndex;
@endphp
<div class="container-fluid">
    <div class="stat-card" x-data="questionForm()" x-init="type='{{ $question->type }}'; options = @json($pgOptionValues); correctOption = {{ $correctOptionIndex }}; correctBoolean = {{ $question->correct_boolean === null ? 'true' : ($question->correct_boolean ? 'true' : 'false') }};">
        <h5 class="fw-bold mb-4">Edit Soal</h5>
        
        <form action="{{ route('questions.update', $question) }}" method="POST">
            @csrf
            @method('PUT')
            <input type="hidden" name="type" x-model="type">
            
            <!-- ===== BAGIAN 1: TIPE SOAL ===== -->
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
                @error('type')
                    <small class="text-danger">{{ $message }}</small>
                @enderror
            </div>
            
            <!-- ===== BAGIAN 2: INFORMASI DASAR ===== -->
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
                    @error('subject_id')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Jenjang <span class="text-danger">*</span></label>
                    <select name="jenjang" class="form-select @error('jenjang') is-invalid @enderror" required>
                        <option value="">Pilih Jenjang</option>
                        <option value="SD" {{ old('jenjang', $question->jenjang) == 'SD' ? 'selected' : '' }}>SD</option>
                        <option value="SMP" {{ old('jenjang', $question->jenjang) == 'SMP' ? 'selected' : '' }}>SMP</option>
                        <option value="SMA" {{ old('jenjang', $question->jenjang) == 'SMA' ? 'selected' : '' }}>SMA</option>
                    </select>
                    @error('jenjang')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Kurikulum <span class="text-danger">*</span></label>
                    <select name="curriculum" class="form-select @error('curriculum') is-invalid @enderror" required>
                        <option value="">Pilih Kurikulum</option>
                        <option value="merdeka" {{ old('curriculum', $question->curriculum) == 'merdeka' ? 'selected' : '' }}>Merdeka</option>
                        <option value="kbc" {{ old('curriculum', $question->curriculum) == 'kbc' ? 'selected' : '' }}>KBC</option>
                        <option value="both" {{ old('curriculum', $question->curriculum) == 'both' ? 'selected' : '' }}>Merdeka & KBC</option>
                    </select>
                    @error('curriculum')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
            </div>
            
            <!-- ===== BAGIAN 3: TAKSONOMI ===== -->
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
                    <small class="text-muted">KKO akan otomatis terfilter berdasarkan Level yang dipilih</small>
                    @error('level_c')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">KKO (Kata Kerja Operasional) <span class="text-danger">*</span></label>
                    <select name="kko_id" class="form-select @error('kko_id') is-invalid @enderror" required>
                        <option value="">Pilih KKO</option>
                        @foreach($kkoList as $kko)
                            <option value="{{ $kko->id }}" {{ old('kko_id', $question->kko_id) == $kko->id ? 'selected' : '' }}>
                                {{ $kko->verb }} ({{ $kko->level }})
                            </option>
                        @endforeach
                    </select>
                    @error('kko_id')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
            </div>
            
            <!-- ===== BAGIAN 4: TEKS SOAL ===== -->
            <div class="mb-3">
                <label class="form-label fw-bold">Teks Soal <span class="text-danger">*</span></label>
                <textarea name="question_text" class="form-control @error('question_text') is-invalid @enderror" 
                          rows="4" required>{{ old('question_text', $question->question_text) }}</textarea>
                @error('question_text')
                    <small class="text-danger">{{ $message }}</small>
                @enderror
            </div>
            
            <!-- ===== BAGIAN 5: AREA JAWABAN ===== -->
            <div class="mb-3">
                <label class="form-label fw-bold">Area Jawaban</label>
                
                <!-- PG -->
                <div x-show="isPG" x-transition>
                    <div class="alert alert-info">Klik radio di kiri untuk menandai jawaban yang benar.</div>
                    <template x-for="(option, index) in options" :key="index">
                        <div class="input-group mb-2">
                            <span class="input-group-text">
                                <input type="radio" name="correct_option" :value="index" x-model="correctOption">
                            </span>
                            <input type="text" :name="'options[' + index + ']'" class="form-control" x-model="options[index]"
                                   :placeholder="'Pilihan ' + String.fromCharCode(65 + index)" :disabled="!isPG">
                            <button type="button" class="btn btn-outline-danger" @click="removeOption(index)" x-show="options.length > 4">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </template>
                    <div class="mt-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary" @click="addOption()" x-show="options.length < 5">
                            <i class="fas fa-plus"></i> Tambah Opsi
                        </button>
                    </div>
                </div>
                
                <!-- Uraian -->
                <div x-show="isUraian" x-transition>
                    <textarea x-bind:name="isUraian ? 'rubric_text' : null" class="form-control" rows="3" 
                              placeholder="Kunci Jawaban / Rubrik Penilaian" :disabled="!isUraian">{{ old('rubric_text', $question->essayRubric->rubric_text ?? '') }}</textarea>
                </div>
                
                <!-- Menjodohkan -->
                <div x-show="isMenjodohkan" x-transition>
                    <div class="alert alert-info">Buat pasangan pernyataan dan jawaban.</div>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="45%">Pernyataan</th>
                                    <th width="45%">Pasangan Jawaban</th>
                                    <th width="5%">Hapus</th>
                                </tr>
                            </thead>
                            <tbody>
                                @php $pairs = $question->matchingPairs ?? collect(); @endphp
                                @foreach($pairs as $index => $pair)
                                    <tr>
                                        <td class="text-center">{{ $loop->iteration }}</td>
                                        <td>
                                            <input type="text" x-bind:name="isMenjodohkan ? 'left_texts[{{ $index }}]' : null" class="form-control form-control-sm" 
                                                   value="{{ old('left_texts.' . $index, $pair->left_text) }}" :disabled="!isMenjodohkan">
                                        </td>
                                        <td>
                                            <input type="text" x-bind:name="isMenjodohkan ? 'right_texts[{{ $index }}]' : null" class="form-control form-control-sm" 
                                                   value="{{ old('right_texts.' . $index, $pair->right_text) }}" :disabled="!isMenjodohkan">
                                        </td>
                                        <td class="text-center">
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
                <div x-show="isBenarSalah" x-transition>
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
                        <input type="hidden" x-bind:name="isBenarSalah ? 'correct_boolean' : null" :value="correctBoolean">
                    </div>
                </div>
            </div>
            
            <!-- ===== BAGIAN 6: INDIKATOR SOAL ===== -->
            <div class="mb-3">
                <label class="form-label fw-bold">Indikator Soal</label>
                <textarea name="indicator_text" class="form-control" rows="2" 
                          placeholder="Kompetensi yang diukur...">{{ old('indicator_text', $question->indicator_text) }}</textarea>
            </div>
            
            <!-- ===== BAGIAN 7: TOMBOL AKSI ===== -->
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

