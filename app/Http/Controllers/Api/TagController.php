<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * JSON API for the React SPA (session-cookie auth, same-origin, CSRF-protected
 * via the web middleware group). This is the reference pattern for migrating
 * remaining resources off Blade views.
 */
class TagController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Tag::query()
                ->withCount('questions')
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tag,name',
            'color' => 'required|string|max:7',
        ]);

        $tag = Tag::create([
            ...$validated,
            'slug' => Tag::uniqueSlug($validated['name']),
        ]);

        return response()->json(['data' => $tag], 201);
    }

    public function update(Request $request, Tag $tag): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tag,name,' . $tag->id,
            'color' => 'required|string|max:7',
        ]);

        $tag->update([
            ...$validated,
            'slug' => Tag::uniqueSlug($validated['name'], $tag->id),
        ]);

        return response()->json(['data' => $tag]);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        return response()->json(['data' => null]);
    }
}
