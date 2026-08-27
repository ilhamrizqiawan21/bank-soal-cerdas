<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Subject::withCount('questions')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:subjects,name'],
            'code' => ['nullable', 'string', 'max:10'],
        ]);

        return response()->json(['data' => Subject::create($validated)], 201);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects', 'name')->ignore($subject->id)],
            'code' => ['nullable', 'string', 'max:10'],
        ]);

        $subject->update($validated);

        return response()->json(['data' => $subject->fresh()]);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        abort_if($subject->questions()->exists(), 422, 'Mata pelajaran tidak dapat dihapus karena masih digunakan oleh soal.');

        $subject->delete();

        return response()->json(['data' => null]);
    }
}
