@extends('layouts.app')

@section('title', 'Kolaborasi')
@section('breadcrumb', 'Kolaborasi')

@section('content')
<div class="container-fluid">
    <h5 class="fw-bold mb-4">Manajemen Kolaborasi</h5>

    <!-- Share Soal -->
    <div class="stat-card mb-4">
        <h6 class="fw-bold mb-3">📤 Share Soal</h6>
        <form action="{{ route('share.soal', ['id' => 0]) }}" method="POST" id="shareSoalForm">
            @csrf
            <div class="row g-2">
                <div class="col-md-4">
                    <select name="question_id" class="form-select" required>
                        <option value="">Pilih Soal</option>
                        @foreach($questions ?? [] as $q)
                            <option value="{{ $q->id }}">{{ Str::limit($q->question_text, 50) }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-3">
                    <select name="shared_to" class="form-select" required>
                        <option value="">Pilih Guru</option>
                        @foreach($guruList ?? [] as $guru)
                            <option value="{{ $guru->id }}">{{ $guru->name }} ({{ $guru->email }})</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <select name="permission" class="form-select">
                        <option value="view">Lihat</option>
                        <option value="edit">Edit</option>
                        <option value="copy">Copy</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-share me-1"></i> Share Soal
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- Share Paket -->
    <div class="stat-card mb-4">
        <h6 class="fw-bold mb-3">📦 Share Paket Soal</h6>
        <form action="{{ route('share.paket', ['id' => 0]) }}" method="POST" id="sharePaketForm">
            @csrf
            <div class="row g-2">
                <div class="col-md-4">
                    <select name="paket_soal_id" class="form-select" required>
                        <option value="">Pilih Paket</option>
                        @foreach($pakets ?? [] as $p)
                            <option value="{{ $p->id }}">{{ $p->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-3">
                    <select name="shared_to" class="form-select" required>
                        <option value="">Pilih Guru</option>
                        @foreach($guruList ?? [] as $guru)
                            <option value="{{ $guru->id }}">{{ $guru->name }} ({{ $guru->email }})</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <select name="permission" class="form-select">
                        <option value="view">Lihat</option>
                        <option value="edit">Edit</option>
                        <option value="copy">Copy</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-share me-1"></i> Share Paket
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- Daftar Share -->
    <div class="stat-card">
        <h6 class="fw-bold mb-3">📋 Daftar Kolaborasi</h6>
        
        @if(($shareSoal ?? collect())->isEmpty() && ($sharePaket ?? collect())->isEmpty())
            <div class="text-center py-5">
                <i class="fas fa-share-alt fa-3x text-muted mb-3 d-block"></i>
                <p class="text-muted">Belum ada aktivitas kolaborasi.</p>
            </div>
        @else
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Jenis</th>
                            <th>Judul</th>
                            <th>Dibagikan oleh</th>
                            <th>Kepada</th>
                            <th>Izin</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($shareSoal ?? [] as $item)
                            <tr>
                                <td><span class="badge bg-primary">Soal</span></td>
                                <td>{{ Str::limit($item->question->question_text ?? '-', 50) }}</td>
                                <td>{{ $item->sharedBy->name ?? '-' }}</td>
                                <td>{{ $item->sharedTo->name ?? '-' }}</td>
                                <td>{{ $item->permission_label }}</td>
                                <td>
                                    @if($item->is_accepted)
                                        <span class="badge bg-success">Diterima</span>
                                    @else
                                        <span class="badge bg-warning">Pending</span>
                                    @endif
                                </td>
                                <td>
                                    @if(!$item->is_accepted && $item->shared_to == auth()->id())
                                        <div class="btn-group btn-group-sm">
                                            <a href="{{ route('share.soal.accept', $item->id) }}" class="btn btn-success">
                                                <i class="fas fa-check"></i>
                                            </a>
                                            <a href="{{ route('share.soal.reject', $item->id) }}" class="btn btn-danger">
                                                <i class="fas fa-times"></i>
                                            </a>
                                        </div>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                        @foreach($sharePaket ?? [] as $item)
                            <tr>
                                <td><span class="badge bg-success">Paket</span></td>
                                <td>{{ $item->paketSoal->name ?? '-' }}</td>
                                <td>{{ $item->sharedBy->name ?? '-' }}</td>
                                <td>{{ $item->sharedTo->name ?? '-' }}</td>
                                <td>{{ $item->permission_label }}</td>
                                <td>
                                    @if($item->is_accepted)
                                        <span class="badge bg-success">Diterima</span>
                                    @else
                                        <span class="badge bg-warning">Pending</span>
                                    @endif
                                </td>
                                <td>
                                    @if(!$item->is_accepted && $item->shared_to == auth()->id())
                                        <div class="btn-group btn-group-sm">
                                            <a href="{{ route('share.paket.accept', $item->id) }}" class="btn btn-success">
                                                <i class="fas fa-check"></i>
                                            </a>
                                            <a href="{{ route('share.paket.reject', $item->id) }}" class="btn btn-danger">
                                                <i class="fas fa-times"></i>
                                            </a>
                                        </div>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</div>
@endsection

@push('scripts')
<script>
// Handle share soal form submission
document.getElementById('shareSoalForm')?.addEventListener('submit', function(e) {
    const questionId = this.querySelector('select[name="question_id"]').value;
    if (!questionId) {
        e.preventDefault();
        alert('Pilih soal terlebih dahulu!');
        return false;
    }
    this.action = this.action.replace('/0', '/' + questionId);
});

// Handle share paket form submission
document.getElementById('sharePaketForm')?.addEventListener('submit', function(e) {
    const paketId = this.querySelector('select[name="paket_soal_id"]').value;
    if (!paketId) {
        e.preventDefault();
        alert('Pilih paket soal terlebih dahulu!');
        return false;
    }
    this.action = this.action.replace('/0', '/' + paketId);
});
</script>
@endpush