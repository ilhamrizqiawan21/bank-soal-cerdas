@extends('layouts.app')

@section('title', 'Tambah Soal')
@section('breadcrumb', 'Tambah Soal')
@section('breadcrumb_parent', 'Bank Soal')
@section('breadcrumb_parent_url', route('questions.index'))

@section('content')
<div class="container-fluid">
    <div class="stat-card question-form-card" x-data="questionForm()">
        <h5 class="fw-bold mb-4">Tambah Soal Baru</h5>
        <form action="{{ route('questions.store') }}" method="POST">
            @csrf
            <input type="hidden" name="type" x-model="type">
            <div class="mb-4"><label class="form-label fw-bold">Tipe Soal <span class="text-danger">*</span></label><div class="row g-2">@foreach([['pg','fa-list-ul','PG','Pilihan Ganda'],['uraian','fa-pen','Uraian','Essay / Uraian'],['menjodohkan','fa-link','Menjodohkan','Pasangan'],['benar_salah','fa-check-circle','Benar/Salah','True/False']] as $item)<div class="col-md-3"><div class="type-selector-card" :class="{active: type === '{{ $item[0] }}'}" @click="type='{{ $item[0] }}'"><i class="fas {{ $item[1] }}"></i><span class="d-block fw-bold">{{ $item[2] }}</span><small class="text-muted">{{ $item[3] }}</small></div></div>@endforeach</div></div>
            <div class="row mb-3">
                <div class="col-md-4"><label class="form-label fw-bold">Mata Pelajaran <span class="text-danger">*</span></label><div class="input-group"><select name="subject_id" class="form-select" required><option value="">Pilih Mata Pelajaran</option>@foreach($subjects as $subject)<option value="{{ $subject->id }}" @selected(old('subject_id') == $subject->id)>{{ $subject->name }}</option>@endforeach</select><a href="{{ route('subjects.create') }}" class="btn btn-outline-primary" title="Tambah mata pelajaran"><i class="fas fa-plus"></i></a></div></div>
                <div class="col-md-4"><label class="form-label fw-bold">Jenjang <span class="text-danger">*</span></label><select name="jenjang" class="form-select" required><option value="">Pilih Jenjang</option><option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option></select></div>
                <div class="col-md-4"><label class="form-label fw-bold">Kurikulum <span class="text-danger">*</span></label><select name="curriculum" class="form-select" required><option value="">Pilih Kurikulum</option><option value="merdeka">Merdeka</option><option value="kbc">KBC</option><option value="both">Merdeka & KBC</option></select></div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6"><label class="form-label fw-bold">Level Kognitif <span class="text-danger">*</span></label><select name="level_c" class="form-select" x-model="level" @change="loadKKO(level)" required><option value="">Pilih Level</option><option value="L1">L1 - Pengetahuan & Pemahaman</option><option value="L2">L2 - Penerapan</option><option value="L3">L3 - Penalaran / HOTS</option></select><small class="text-muted">L1 = pengetahuan/pemahaman, L2 = penerapan, L3 = penalaran/HOTS.</small></div>
                <div class="col-md-6"><label class="form-label fw-bold">KKO <span class="text-danger">*</span></label><select name="kko_id" class="form-select" required><option value="">Pilih KKO</option><template x-for="kko in kkoOptions" :key="kko.id"><option :value="kko.id" x-text="`${kko.verb} (${kko.level})`"></option></template></select></div>
            </div>
            <div class="mb-3"><label class="form-label fw-bold">Teks Soal <span class="text-danger">*</span></label><textarea name="question_text" class="form-control" rows="5" required>{{ old('question_text') }}</textarea></div>
            <div class="mb-4"><label class="form-label fw-bold">Area Jawaban</label>
                <div x-show="isPG"><div class="alert alert-info">Pilih radio untuk menentukan jawaban benar.</div><template x-for="(option,index) in options" :key="index"><div class="input-group mb-2"><span class="input-group-text"><input type="radio" name="correct_option" :value="index" x-model="correctOption"></span><input type="text" :name="`options[${index}]`" class="form-control" :placeholder="`Pilihan ${String.fromCharCode(65+index)}`" x-model="options[index]" :disabled="!isPG"></div></template><button type="button" class="btn btn-sm btn-outline-secondary" @click="addOption()" x-show="options.length < 5"><i class="fas fa-plus"></i> Tambah Opsi</button></div>
                <div x-show="isUraian"><textarea name="rubric_text" class="form-control" rows="4" placeholder="Kunci jawaban / rubrik penilaian" :disabled="!isUraian"></textarea></div>
                <div x-show="isMenjodohkan"><div class="alert alert-info">Buat pasangan pernyataan dan jawaban.</div><template x-for="(pair,index) in matchingPairs" :key="index"><div class="row g-2 mb-2"><div class="col-md-6"><input type="text" :name="`left_texts[${index}]`" class="form-control" placeholder="Pernyataan" x-model="pair.left" :disabled="!isMenjodohkan"></div><div class="col-md-5"><input type="text" :name="`right_texts[${index}]`" class="form-control" placeholder="Pasangan jawaban" x-model="pair.right" :disabled="!isMenjodohkan"></div><div class="col-md-1"><button type="button" class="btn btn-outline-danger" @click="removePair(index)"><i class="fas fa-trash"></i></button></div></div></template><button type="button" class="btn btn-sm btn-primary" @click="addPair()"><i class="fas fa-plus"></i> Tambah Baris</button></div>
                <div x-show="isBenarSalah"><button type="button" class="btn btn-success me-2" @click="correctBoolean=true">Benar</button><button type="button" class="btn btn-danger" @click="correctBoolean=false">Salah</button><input type="hidden" name="correct_boolean" :value="correctBoolean"></div>
            </div>
            <div class="mb-4"><label class="form-label fw-bold">Indikator Soal</label><textarea name="indicator_text" class="form-control" rows="2" placeholder="Kompetensi yang diukur...">{{ old('indicator_text') }}</textarea></div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i> Simpan Soal</button><a href="{{ route('questions.index') }}" class="btn btn-outline-secondary">Batal</a>
        </form>
    </div>
</div>
@endsection
