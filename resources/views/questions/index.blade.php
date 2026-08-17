@extends('layouts.app')

@section('title', 'Bank Soal')
@section('breadcrumb', 'Bank Soal')

@section('content')
<div class="container-fluid">
    <!-- Header dengan Tombol Import/Export -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">Daftar Soal</h5>
        <div class="d-flex gap-2">
            <!-- Tombol Import -->
            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#importModal">
                <i class="fas fa-file-import me-1"></i> Import
            </button>
            
            <!-- Tombol Export -->
            <a href="{{ route('questions.export') }}" class="btn btn-info btn-sm">
                <i class="fas fa-file-export me-1"></i> Export
            </a>
            
            <a href="{{ route('questions.create') }}" class="btn btn-primary btn-sm">
                <i class="fas fa-plus me-1"></i> Tambah Soal
            </a>
        </div>
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
                        @foreach($kkoList ?? [] as $kko)
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
    <div class="table-responsive">
    <table class="table table-striped table-hover table-soal table-responsive-card mb-0">
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
                    @forelse($questions ?? [] as $index => $question)
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
                                       data-confirm="Duplikasi soal ini?"
                                       data-confirm-title="Konfirmasi Duplikasi"
                                       data-confirm-text="Ya, duplikasi"
                                       data-confirm-href="{{ route('questions.duplicate', $question) }}">
                                        <i class="fas fa-copy"></i>
                                    </a>
                                    <button type="button" class="btn btn-outline-danger"
                                            data-confirm="Yakin hapus soal ini?"
                                            data-confirm-title="Hapus Soal"
                                            data-confirm-text="Ya, hapus"
                                            data-confirm-form="delete-form-{{ $question->id }}">
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
                                <x-empty-state
                                    icon="fas fa-inbox"
                                    title="Belum ada soal"
                                    description="Klik tombol di atas untuk menambahkan soal pertama Anda."
                                    button-text="Tambah Soal"
                                    button-href="{{ route('questions.create') }}"
                                    button-class="btn btn-primary"
                                />
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
                Menampilkan {{ $questions->firstItem() ?? 0 }}–{{ $questions->lastItem() ?? 0 }} dari {{ $questions->total() ?? 0 }} data
            </small>
            {{ $questions->appends(request()->query())->links() }}
        </div>
    </div>
</div>

<!-- ===== MODAL IMPORT ===== -->
<div class="modal fade" id="importModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="importModalLabel">
                    <i class="fas fa-file-import me-2"></i> Import Soal dari Excel
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ route('questions.import') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    @if(session('import_error'))
                        <div class="alert alert-danger alert-dismissible fade show">
                            {{ session('import_error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Pilih File Excel</label>
                        <input type="file" name="file" class="form-control @error('file') is-invalid @enderror" 
                               accept=".xlsx,.xls,.csv" required>
                        <small class="text-muted">Format: .xlsx, .xls, .csv (Max 2MB)</small>
                        @error('file')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="alert alert-info">
                        <strong><i class="fas fa-info-circle me-1"></i> Format yang diperlukan:</strong>
                        <ul class="mb-0 mt-1">
                            <li><strong>mata_pelajaran</strong> - Nama mata pelajaran</li>
                            <li><strong>jenjang</strong> - SD / SMP / SMA</li>
                            <li><strong>kurikulum</strong> - merdeka / kbc / both</li>
                            <li><strong>tipe_soal</strong> - pg / uraian / menjodohkan / benar_salah</li>
                            <li><strong>level_kognitif</strong> - C1 / C2 / C3 / C4 / C5 / C6</li>
                            <li><strong>kko</strong> - Kata Kerja Operasional (contoh: Menyebutkan)</li>
                            <li><strong>teks_soal</strong> - Teks pertanyaan</li>
                            <li><strong>indikator</strong> - Indikator soal (opsional)</li>
                            <li><strong>jawaban_benar</strong> - Untuk tipe benar_salah (opsional)</li>
                        </ul>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <a href="{{ route('questions.export') }}" class="btn btn-sm btn-secondary">
                            <i class="fas fa-download me-1"></i> Download Template
                        </a>
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="showExample()">
                            <i class="fas fa-eye me-1"></i> Lihat Contoh
                        </button>
                    </div>
                    
                    <div id="exampleData" style="display: none;" class="mt-3">
                        <div class="card card-body bg-light">
                            <table class="table table-sm table-bordered mb-0">
                                <thead>
                                    <tr>
                                        <th>mata_pelajaran</th>
                                        <th>jenjang</th>
                                        <th>kurikulum</th>
                                        <th>tipe_soal</th>
                                        <th>level_kognitif</th>
                                        <th>kko</th>
                                        <th>teks_soal</th>
                                        <th>indikator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Matematika</td>
                                        <td>SMA</td>
                                        <td>merdeka</td>
                                        <td>pg</td>
                                        <td>C3</td>
                                        <td>Menerapkan</td>
                                        <td>Hitunglah nilai dari 2x + 3y jika x=4 dan y=2</td>
                                        <td>Siswa dapat menghitung persamaan linear</td>
                                    </tr>
                                    <tr>
                                        <td>IPA</td>
                                        <td>SMP</td>
                                        <td>kbc</td>
                                        <td>benar_salah</td>
                                        <td>C2</td>
                                        <td>Menjelaskan</td>
                                        <td>Air adalah zat cair yang tidak berwarna</td>
                                        <td>Siswa dapat menjelaskan sifat fisik air</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-upload me-1"></i> Import
                    </button>
                </div>
            </form>
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
    
    // Show example data
    function showExample() {
        var example = document.getElementById('exampleData');
        if (example.style.display === 'none') {
            example.style.display = 'block';
        } else {
            example.style.display = 'none';
        }
    }
</script>
@endpush