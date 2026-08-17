<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    public function index(Request $request)
    {
        $query = Kategori::with(['parent', 'questions']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $kategori = $query->latest()->paginate(10);
        return view('kategori.index', compact('kategori'));
    }

    public function create()
    {
        $parentKategori = Kategori::whereNull('parent_id')->get();
        return view('kategori.create', compact('parentKategori'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:kategori,code',
            'type' => 'required|in:kd,topik,bab',
            'parent_id' => 'nullable|exists:kategori,id',
            'description' => 'nullable|string',
        ]);

        Kategori::create($request->validated());

        return redirect()->route('kategori.index')
            ->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function show(Kategori $kategori)
    {
        $kategori->load(['parent', 'children', 'questions']);
        return view('kategori.show', compact('kategori'));
    }

    public function edit(Kategori $kategori)
    {
        $parentKategori = Kategori::whereNull('parent_id')->get();
        return view('kategori.edit', compact('kategori', 'parentKategori'));
    }

    public function update(Request $request, Kategori $kategori)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:kategori,code,' . $kategori->id,
            'type' => 'required|in:kd,topik,bab',
            'parent_id' => 'nullable|exists:kategori,id',
            'description' => 'nullable|string',
        ]);

        $kategori->update($request->validated());

        return redirect()->route('kategori.index')
            ->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(Kategori $kategori)
    {
        $kategori->delete();
        return redirect()->route('kategori.index')
            ->with('success', 'Kategori berhasil dihapus!');
    }
}