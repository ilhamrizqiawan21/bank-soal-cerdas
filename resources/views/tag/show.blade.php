@extends('layouts.app')

@section('title', 'Detail Tag')
@section('breadcrumb', 'Detail Tag')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Tag</h5>
            <div>
                <a href="{{ route('tag.edit', $tag) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit me-1"></i> Edit
                </a>
                <a href="{{ route('tag.index') }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left me-1"></i> Kembali
                </a>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="mb-3">
                    <h4>
                        <span class="badge" style="background-color: {{ $tag->color }}; color: #fff; font-size: 20px; padding: 10px 20px;">
                            {{ $tag->name }}
                        </span>
                    </h4>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted d-block">Slug</small>
                    <span class="fw-bold">{{ $tag->slug }}</span>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted d-block">Warna</small>
                    <div style="width: 50px; height: 50px; background-color: {{ $tag->color }}; border-radius: 50%;"></div>
                </div>
                
                <!-- Daftar Soal -->
                <h6 class="fw-bold mt-4">Soal dengan Tag ini</h6>
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
                            @forelse($tag->questions as $index => $question)
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
                                    <td colspan="3" class="text-center text-muted">Belum ada soal dengan tag ini.</td>
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
                            <span class="fw-bold">{{ $tag->questions->count() }}</span>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted d-block">Dibuat pada</small>
                            <span class="fw-bold">{{ $tag->created_at->format('d M Y H:i') }}</span>
                        </div>
                        <div>
                            <small class="text-muted d-block">Terakhir diubah</small>
                            <span class="fw-bold">{{ $tag->updated_at->format('d M Y H:i') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection