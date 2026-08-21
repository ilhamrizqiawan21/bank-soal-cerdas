<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::withCount('questions')->orderBy('name')->get();
        return view('subjects.index', compact('subjects'));
    }

    public function create()
    {
        return view('subjects.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:subjects,name'],
            'code' => ['nullable', 'string', 'max:10'],
        ], [
            'name.required' => 'Nama mata pelajaran wajib diisi.',
            'name.unique' => 'Mata pelajaran tersebut sudah ada.',
            'code.max' => 'Kode maksimal 10 karakter.',
        ]);

        Subject::create($validated);

        return redirect()->route('subjects.index')->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function edit(Subject $subject)
    {
        return view('subjects.edit', compact('subject'));
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects', 'name')->ignore($subject->id)],
            'code' => ['nullable', 'string', 'max:10'],
        ], [
            'name.required' => 'Nama mata pelajaran wajib diisi.',
            'name.unique' => 'Mata pelajaran tersebut sudah ada.',
            'code.max' => 'Kode maksimal 10 karakter.',
        ]);

        $subject->update($validated);

        return redirect()->route('subjects.index')->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroy(Subject $subject)
    {
        if ($subject->questions()->exists()) {
            return back()->with('error', 'Mata pelajaran tidak dapat dihapus karena masih digunakan oleh soal.');
        }

        try {
            $subject->delete();
            return redirect()->route('subjects.index')->with('success', 'Mata pelajaran berhasil dihapus.');
        } catch (\Throwable $e) {
            Log::error('Delete subject error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus mata pelajaran.');
        }
    }
}
