// Ujian (CBT) client-side proctoring & submit flow.
// Moved out of ujian/kerjakan.blade.php. Page config is injected by the Blade
// view via #ujian-data (JSON payload) and data-* attributes on #ujian-container.
(function () {
    'use strict';

    const container = document.getElementById('ujian-container');

    if (!container) return;

    // ===== HYDRATE EXAM PAYLOAD FOR ALPINE (ujianApp reads window globals) =====
    try {
        const payloadTag = document.getElementById('ujian-data');
        window.__ujianData = payloadTag ? JSON.parse(payloadTag.textContent) : [];
        const deadline = parseInt(container.dataset.deadline || '', 10);
        window.__ujianDeadline = Number.isFinite(deadline) && deadline > 0 ? deadline : null;
        window.__ujianId = container.dataset.ujianId ?? null;
    } catch (error) {
        window.__ujianData = [];
        console.error('Gagal membaca data ujian', error);
    }

    const submitUrl = container.dataset.submitUrl;
    const resultUrl = container.dataset.resultUrl;

    let warningCount = 0;
    const MAX_WARNING = 3;

    // ===== 1. MODE LAYAR PENUH =====
    function enableFullscreen() {
        if (!document.fullscreenElement) {
            container.requestFullscreen?.().catch?.(() => {});
        }
    }

    // ===== 2. DETEKSI TAB SWITCH =====
    // Hanya gunakan visibilitychange sebagai sumber utama deteksi keluar.
    // blur TIDAK dipakai untuk increment karena saat alt-tab, keduanya
    // terpicu bersamaan dan menyebabkan double-increment (1 aksi = +2 peringatan).
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            warningCount++;
            showWarning();

            if (warningCount >= MAX_WARNING) {
                showToast('Ujian Berakhir', 'Anda telah keluar dari ujian sebanyak 3 kali. Ujian akan otomatis disubmit.', 'danger');
                submitUjian(true);
            }
        }
    });

    // ===== 3. DETEKSI BLUR (Keluar dari Window) =====
    // Fallback hanya jika visibilitychange tidak tersedia (browser lama).
    if (typeof document.hidden === 'undefined') {
        window.addEventListener('blur', function () {
            warningCount++;
            showWarning();

            if (warningCount >= MAX_WARNING) {
                showToast('Ujian Berakhir', 'Anda telah keluar dari ujian sebanyak 3 kali. Ujian akan otomatis disubmit.', 'danger');
                submitUjian(true);
            }
        });
    }

    // ===== 4. TAMPILKAN PERINGATAN =====
    function showWarning() {
        const overlay = document.getElementById('warning-overlay');
        if (overlay) {
            overlay.classList.add('show');
            document.getElementById('warning-count').textContent =
                `Peringatan: ${warningCount}/${MAX_WARNING}`;
        }
    }

    function closeWarning() {
        document.getElementById('warning-overlay')?.classList.remove('show');
    }

    // ===== 5. LARANGAN COPY-PASTE =====
    ['copy', 'paste'].forEach(function (type) {
        document.addEventListener(type, function (e) {
            e.preventDefault();
            showToast('Peringatan', 'Copy-paste tidak diizinkan selama ujian!', 'warning');
            return false;
        });
    });

    document.addEventListener('cut', function (e) {
        e.preventDefault();
        showToast('Peringatan', 'Cut tidak diizinkan selama ujian!', 'warning');
        return false;
    });

    // ===== 6. LARANGAN KLIK KANAN =====
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showToast('Peringatan', 'Klik kanan tidak diizinkan selama ujian!', 'warning');
        return false;
    });

    // ===== 7. LARANGAN DRAG =====
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    });

    // ===== 8. LARANGAN SELECT TEXT =====
    document.addEventListener('selectstart', function (e) {
        const tag = e.target.tagName;
        if (tag !== 'TEXTAREA' && tag !== 'INPUT') {
            e.preventDefault();
            return false;
        }
    });

    // ===== 9. DETEKSI FULLSCREEN EXIT =====
    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement) {
            warningCount++;
            showWarning();

            if (warningCount >= MAX_WARNING) {
                showToast('Ujian Berakhir', 'Anda keluar dari mode layar penuh. Ujian akan otomatis disubmit.', 'danger');
                submitUjian(true);
            }
        }
    });

    // ===== 10. TOAST NOTIFICATION =====
    function showToast(title, message, type = 'warning') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 999999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.innerHTML = `
            <strong>${title}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // ===== 11. SUBMIT UJIAN =====
    async function submitUjian(force = false) {
        // Simpan jawaban terakhir dulu sebelum submit
        if (window.__ujianState && typeof window.__ujianState.flush === 'function') {
            try {
                await window.__ujianState.flush();
            } catch (e) {
                showToast('Gagal', 'Gagal menyimpan jawaban terakhir.', 'danger');
            }
        }

        if (force) {
            doSubmitUjian();
            return;
        }

        // Konfirmasi pakai modal kustom (bukan confirm() native)
        window.confirmDialog?.({
            title: 'Submit Ujian',
            message: 'Yakin ingin submit ujian? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Submit',
            onConfirm: doSubmitUjian,
        });
    }

    function doSubmitUjian() {
        fetch(submitUrl, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            }
        }).then((res) => {
            if (res.ok) {
                window.location.href = resultUrl;
            } else {
                res.json().then((data) => {
                    showToast('Gagal', data.error || 'Gagal submit ujian.', 'danger');
                }).catch(() => {
                    showToast('Gagal', 'Gagal submit ujian.', 'danger');
                });
            }
        });
    }

    // ===== 12. INISIALISASI =====
    enableFullscreen();

    // Cegah keluar dengan tombol ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.fullscreenElement) {
            e.preventDefault();
            return false;
        }
    });

    // Cegah F12 (Developer Tools)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12') {
            e.preventDefault();
            showToast('Peringatan', 'Developer Tools tidak diizinkan!', 'danger');
            return false;
        }
    });

    // Cegah Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            showToast('Peringatan', 'View source tidak diizinkan!', 'danger');
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) {
            e.preventDefault();
            showToast('Peringatan', 'Developer Tools tidak diizinkan!', 'danger');
            return false;
        }
    });

    // Expose fungsi untuk Alpine.js
    window.closeWarning = closeWarning;
    window.submitUjian = submitUjian;
})();
