@extends('layouts.app')

@section('title', 'Mata Pelajaran')
@section('breadcrumb', 'Mata Pelajaran')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h5 class="fw-bold mb-1">Mata Pelajaran</h5>
            <p class="text-muted mb-0">Kelola mata pelajaran yang tersedia di Bank Soal.</p>
        </div>
        <a href="{{ route('subjects.create') }}" class="btn btn-primary btn-sm">
            <i class="fas fa-plus me-1"></i> Tambah Mata Pelajaran
        </a>
    </div>

    <div class="stat-card">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th width="60">No</th>
                        <th>Nama Mata Pelajaran</th>
                        <th width="150">Kode</th>
                        <th width="160">Jumlah Soal</th>
                        <th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($subjects as $index => $subject)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="fw-semibold">{{ $subject->name }}</td>
                            <td>{{ $subject->code ?: '-' }}</td>
                            <td><span class="badge bg-info text-white">{{ $subject->questions_count }} soal</span></td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('subjects.edit', $subject) }}" class="btn btn-outline-warning" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <button type="button" class="btn btn-outline-danger"
                                            data-confirm="Yakin ingin menghapus mata pelajaran ini?"
                                            data-confirm-title="Hapus Mata Pelajaran"
                                            data-confirm-text="Ya, hapus"
                                            data-confirm-form="delete-subject-{{ $subject->id }}"
                                            @if($subject->questions_count > 0) disabled title="Masih digunakan oleh soal" @endif>
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <form id="delete-subject-{{ $subject->id }}" action="{{ route('subjects.destroy', $subject) }}" method="POST" class="d-none">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="text-center py-5 text-muted">Belum ada mata pelajaran.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
