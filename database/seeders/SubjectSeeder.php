<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;  // <-- Tambahkan ini

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            'Matematika',
            'IPA',
            'IPS',
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Pendidikan Agama Islam',
            'PKN',
            'Seni Budaya',
            'PJOK',
            'Informatika',
        ];

        foreach ($subjects as $subject) {
            Subject::create(['name' => $subject]);
        }
    }
}