<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KategoriController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Kategori::with(['parent'])->withCount(['children', 'questions']);

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->string('search').'%');
        }

        return response()->json(['data' => $query->orderBy('name')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);

        return response()->json(['data' => Kategori::create($validated)], 201);
    }

    public function update(Request $request, Kategori $kategori): JsonResponse
    {
        $validated = $this->validated($request, $kategori);

        abort_if((int) ($validated['parent_id'] ?? 0) === (int) $kategori->id, 422, 'Kategori tidak boleh menjadi parent dirinya sendiri.');

        $kategori->update($validated);

        return response()->json(['data' => $kategori->fresh(['parent'])]);
    }

    public function destroy(Kategori $kategori): JsonResponse
    {
        abort_if($kategori->children()->exists(), 422, 'Kategori tidak dapat dihapus karena masih memiliki subkategori.');
        abort_if($kategori->questions()->exists(), 422, 'Kategori tidak dapat dihapus karena masih digunakan oleh soal.');

        $kategori->delete();

        return response()->json(['data' => null]);
    }

    private function validated(Request $request, ?Kategori $kategori = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['nullable', 'string', 'max:50', Rule::unique('kategori', 'code')->ignore($kategori?->id)],
            'type' => 'required|in:kd,topik,bab',
            'parent_id' => 'nullable|exists:kategori,id',
            'description' => 'nullable|string',
        ]);
    }
}
