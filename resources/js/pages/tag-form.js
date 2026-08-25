// Tag create/edit form helpers (moved out of tag/create.blade.php & tag/edit.blade.php).
const colorInput = document.querySelector('input[name="color"]');
const colorHex = document.getElementById('colorHex');

if (colorInput && colorHex) {
    colorInput.addEventListener('input', function () {
        colorHex.value = this.value;
    });
}
