@extends('layouts.app')

@section('title', 'Tambah Soal')
@section('breadcrumb', 'Tambah Soal')

@section('content')
<div class="container-fluid">
    <div class="stat-card question-form-card" x-data="questionForm()">
        <h5 class="fw-bold mb-4">Tambah Soal Baru</h5>

        <form action="{{ route('questions.store') }}" method="POST">
            @csrf
            <input type="hidden" name="type" x-model="type">

            <div class="question-form-section">
                <h6 class="question-form-section-title">1. Tipe Soal</h6>
                <div class="mb-4">
                    <label class="form-label fw-bold">Tipe Soal <span class="text-danger">*</span></label>
                    <div class="row g-2">
                        <div class="col-md-3">
                            <div class="type-selector-card" :class="{ 'active': type === 'pg' }" @click="type = 'pg'">
                                <i class="fas fa-list-ul"></i>
                                <span class="d-block fw-bold">PG</span>
                                <small class="text-muted">Pilihan Ganda</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="type-selector-card" :class="{ 'active': type === 'uraian' }" @click="type = 'uraian'">
                                <i class="fas fa-pen"></i>
                                <span class="d-block fw-bold">Uraian</span>
                                <small class="text-muted">Essay / Uraian</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="type-selector-card" :class="{ 'active': type === 'menjodohkan' }" @click="type = 'menjodohkan'">
                                <i class="fas fa-link"></i>
                                <span class="d-block fw-bold">Menjodohkan</span>
                                <small class="text-muted">Pasangan</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="type-selector-card" :class="{ 'active': type === 'benar_salah' }" @click="type = 'benar_salah'">
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
            </div>

            <div class="question-form-section">
                <h6 class="question-form-section-title">2. Informasi Dasar</h6>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Mata Pelajaran <span class="text-danger">*</span></label>
                        <select name="subject_id" class="form-select @error('subject_id') is-invalid @enderror" required>
                            <option value="">Pilih Mata Pelajaran</option>
                            @foreach($subjects as $subject)
                                <option value="{{ $subject->id }}" {{ old('subject_id') == $subject->id ? 'selected' : '' }}>
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
                            <option value="SD" {{ old('jenjang') == 'SD' ? 'selected' : '' }}>SD</option>
                            <option value="SMP" {{ old('jenjang') == 'SMP' ? 'selected' : '' }}>SMP</option>
                            <option value="SMA" {{ old('jenjang') == 'SMA' ? 'selected' : '' }}>SMA</option>
                        </select>
                        @error('jenjang')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Kurikulum <span class="text-danger">*</span></label>
                        <select name="curriculum" class="form-select @error('curriculum') is-invalid @enderror" required>
                            <option value="">Pilih Kurikulum</option>
                            <option value="merdeka" {{ old('curriculum') == 'merdeka' ? 'selected' : '' }}>Merdeka</option>
                            <option value="kbc" {{ old('curriculum') == 'kbc' ? 'selected' : '' }}>KBC</option>
                            <option value="both" {{ old('curriculum') == 'both' ? 'selected' : '' }}>Merdeka & KBC</option>
                        </select>
                        @error('curriculum')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>
            </div>

            <div class="question-form-section">
                <h6 class="question-form-section-title">3. Taksonomi</h6>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Level Kognitif <span class="text-danger">*</span></label>
                        <select name="level_c" class="form-select @error('level_c') is-invalid @enderror"
                                x-model="level" @change="loadKKO(level)" required>
                            <option value="">Pilih Level</option>
                            <option value="C1">C1 - Mengingat</option>
                            <option value="C2">C2 - Memahami</option>
                            <option value="C3">C3 - Menerapkan</option>
                            <option value="C4">C4 - Menganalisis</option>
                            <option value="C5">C5 - Mengevaluasi</option>
                            <option value="C6">C6 - Mencipta</option>
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
                                <option value="{{ $kko->id }}" data-level="{{ $kko->level }}"
                                        {{ old('kko_id') == $kko->id ? 'selected' : '' }}>
                                    {{ $kko->verb }} ({{ $kko->level }})
                                </option>
                            @endforeach
                        </select>
                        @error('kko_id')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>
            </div>

            <div class="question-form-section">
                <h6 class="question-form-section-title">4. Teks Soal</h6>
                <div class="mb-3">
                    <label class="form-label fw-bold">Teks Soal <span class="text-danger">*</span></label>
                    <textarea name="question_text" class="form-control @error('question_text') is-invalid @enderror"
                              rows="4" placeholder="Tulis pertanyaan lengkap..." required>{{ old('question_text') }}</textarea>
                    @error('question_text')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
            </div>

            <div class="question-form-section">
                <h6 class="question-form-section-title">5. Area Jawaban</h6>
                <div class="mb-3">
                    <label class="form-label fw-bold">Area Jawaban</label>

                    <div x-show="isPG" x-transition>
                        <div class="alert alert-info">Klik radio di kiri untuk menandai jawaban yang benar.</div>
                        <div class="row g-2">
                            <template x-for="(option, index) in options" :key="index">
                                <div class="col-md-6">
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <input type="radio" x-bind:name="isPG ? 'correct_option' : null" :value="index" x-model="correctOption" :disabled="!isPG">
                                        </span>
                                        <input type="text" x-bind:name="isPG ? 'options['+index+']' : null" class="form-control"
                                               :placeholder="'Pilihan ' + String.fromCharCode(65 + index)"
                                               x-model="options[index]" :disabled="!isPG">
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div class="mt-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary" @click="options.push('')" x-show="options.length < 5">
                                <i class="fas fa-plus"></i> Tambah Opsi
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-danger" @click="options.pop()" x-show="options.length > 4">
                                <i class="fas fa-minus"></i> Hapus Opsi
                            </button>
                        </div>
                    </div>

                    <div x-show="isUraian" x-transition>
                        <textarea x-bind:name="isUraian ? 'rubric_text' : null" class="form-control" rows="3"
                                  placeholder="Kunci Jawaban / Rubrik Penilaian" :disabled="!isUraian">{{ old('rubric_text') }}</textarea>
                    </div>

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
                                    <template x-for="(pair, index) in matchingPairs" :key="index">
                                        <tr>
                                            <td class="text-center" x-text="index + 1"></td>
                                            <td>
                                                <input type="text" x-bind:name="isMenjodohkan ? 'left_texts['+index+']' : null" class="form-control form-control-sm"
                                                       placeholder="Pernyataan..." x-model="matchingPairs[index].left" :disabled="!isMenjodohkan">
                                            </td>
                                            <td>
                                                <input type="text" x-bind:name="isMenjodohkan ? 'right_texts['+index+']' : null" class="form-control form-control-sm"
                                                       placeholder="Pasangan..." x-model="matchingPairs[index].right" :disabled="!isMenjodohkan">
                                            </td>
                                            <td class="text-center">
                                                <button type="button" class="btn btn-sm btn-outline-danger"
                                                        @click="removePair(index)" x-show="matchingPairs.length > 1">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary" @click="addPair()">
                            <i class="fas fa-plus"></i> Tambah Baris
                        </button>
                    </div>

                    <div x-show="isBenarSalah" x-transition>
                        <div class="d-flex gap-3 flex-wrap">
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
            </div>

            <div class="question-form-section">
                <h6 class="question-form-section-title">6. Indikator Soal</h6>
                <div class="mb-3">
                    <label class="form-label fw-bold">Indikator Soal</label>
                    <textarea name="indicator_text" class="form-control" rows="2"
                              placeholder="Kompetensi yang diukur... Contoh: Siswa dapat mengidentifikasi faktor-faktor yang mempengaruhi...">{{ old('indicator_text') }}</textarea>
                </div>
            </div>

            <div class="question-form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Simpan Soal
                </button>
                <a href="{{ route('questions.index') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection