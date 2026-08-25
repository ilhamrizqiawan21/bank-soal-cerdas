// Paket soal create/edit form helpers (moved out of paket_soal/*.blade.php).
const selectAll = document.getElementById('selectAll');

if (selectAll) {
    selectAll.addEventListener('change', function () {
        document.querySelectorAll('.question-checkbox').forEach(cb => { cb.checked = this.checked; });
    });
}
