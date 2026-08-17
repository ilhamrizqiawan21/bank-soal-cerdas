<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = Tag::with(['questions']);

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $tag = $query->latest()->paginate(10);
        return view('tag.index', compact('tag'));
    }

    public function create()
    {
        return view('tag.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tag,name',
            'color' => 'required|string|max:7',
        ]);

        Tag::create([
            'name' => $request->name,
            'slug' => $this->uniqueSlug($request->name),
            'color' => $request->color,
        ]);

        return redirect()->route('tag.index')
            ->with('success', 'Tag berhasil ditambahkan!');
    }

    public function show(Tag $tag)
    {
        $tag->load(['questions']);
        return view('tag.show', compact('tag'));
    }

    public function edit(Tag $tag)
    {
        return view('tag.edit', compact('tag'));
    }

    public function update(Request $request, Tag $tag)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tag,name,' . $tag->id,
            'color' => 'required|string|max:7',
        ]);

        $tag->update([
            'name' => $request->name,
            'slug' => $this->uniqueSlug($request->name, $tag->id),
            'color' => $request->color,
        ]);

        return redirect()->route('tag.index')
            ->with('success', 'Tag berhasil diperbarui!');
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();
        return redirect()->route('tag.index')
            ->with('success', 'Tag berhasil dihapus!');
    }

    /**
     * Pastikan slug unik (jika bentrok, tambahkan suffix -2, -3, ...).
     */
    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while (Tag::where('slug', $slug)->where('id', '!=', $ignoreId ?? 0)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}