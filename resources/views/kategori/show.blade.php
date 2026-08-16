@extends('layouts.app')

@section('title', 'Detail Kategori')
@section('breadcrumb', 'Detail Kategori')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Kategori</h5>
            <div>
                <a href="{{ route('kategori.edit', $kategori) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit me-1"></i> Edit
                </a>
                <a href="{{ route('kategori.index') }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left me-1"></i> Kembali
                </a>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="mb-3">
                    <h4>{{ $kategori->name }}</h4>
                    <span class="badge bg-{{ $kategori->type === 'kd' ? 'primary' : ($kategori->type === 'topik' ? 'success' : 'warning') }}">
                        {{ $kategori->type_label }}
                    </span>
                    @if($kategori->code)
                        <span class="badge bg-secondary">{{ $kategori->code }}</span>
                    @endif
                </div>
                
                @if($kategori->description)
                    <div class="mb-3">
                        <small class="text-muted d-block">Deskripsi</small>
                        <p>{{ $kategori->description }}</p>
                    </div>
                @endif
                
                @if($kategori->parent)
                    <div class="mb-3">
                        <small class="text-muted d-block">Kategori Induk</small>
                        <span class="fw-bold">{{ $kategori->parent->name }}</span>
                    </div>
                @endif
                
                @if($kategori->children->count() > 0)
                    <div class="mb-3">
                        <small class="text-muted d-block">Sub Kategori</small>
                        @foreach($kategori->children as $child)
                            <span class="badge bg-secondary me-1">{{ $child->name }}</span>
                        @endforeach
                    </div>
                @endif
                
                <!-- Daftar Soal -->
                <h6 class="fw-bold mt-4">Soal dalam Kategori ini</h6>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th width="50">No</th>
                                <th>Soal</th>
                                <th width="100">Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($kategori->questions as $index => $question)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>
                                        <a href="{{ route('questions.show', $question) }}" class="text-decoration-none">
                                            {{ Str::limit($question->question_text, 100) }}
                                        </a>
                                    </td>
                                    <td>
                                        <span class="badge badge-{{ strtolower($question->level_c) }}">
                                            {{ $question->level_c }}
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-center text-muted">Belum ada soal dalam kategori ini.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="fw-bold mb-3">Informasi</h6>
                        <hr>
                        <div class="mb-2">
                            <small class="text-muted d-block">Total Soal</small>
                            <span class="fw-bold">{{ $kategori->questions->count() }}</span>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted d-block">Sub Kategori</small>
                            <span class="fw-bold">{{ $kategori->children->count() }}</span>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted d-block">Dibuat pada</small>
                            <span class="fw-bold">{{ $kategori->created_at->format('d M Y H:i') }}</span>
                        </div>
                        <div>
                            <small class="text-muted d-block">Terakhir diubah</small>
                            <span class="fw-bold">{{ $kategori->updated_at->format('d M Y H:i') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection