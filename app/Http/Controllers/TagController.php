<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        return redirect('/app/tags');
    }

    public function create()
    {
        return redirect('/app/tags');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tag,name',
            'color' => 'required|string|max:7',
        ]);

        Tag::create([
            'name' => $request->name,
            'slug' => Tag::uniqueSlug($request->name),
            'color' => $request->color,
        ]);

        return redirect()->route('tag.index')
            ->with('success', 'Tag berhasil ditambahkan!');
    }

    public function show(Tag $tag)
    {
        return redirect('/app/tags');
    }

    public function edit(Tag $tag)
    {
        return redirect('/app/tags');
    }

    public function update(Request $request, Tag $tag)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tag,name,' . $tag->id,
            'color' => 'required|string|max:7',
        ]);

        $tag->update([
            'name' => $request->name,
            'slug' => Tag::uniqueSlug($request->name, $tag->id),
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
}
