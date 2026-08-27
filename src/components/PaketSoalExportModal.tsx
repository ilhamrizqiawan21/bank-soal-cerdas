import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  Settings,
  Eye,
  Layers,
  BookOpen,
  HelpCircle,
  Clock,
  Sparkles,
  School,
  FileCheck
} from 'lucide-react';
import { PaketSoal, Question } from '../types';
import { useFocusTrap } from '../lib/useFocusTrap';

interface PaketSoalExportModalProps {
  paket: PaketSoal;
  onClose: () => void;
}

export const PaketSoalExportModal: React.FC<PaketSoalExportModalProps> = ({ paket, onClose }) => {
  const { questions, subjects, categories, addToast } = useApp();

  // Export configurations
  const [schoolName, setSchoolName] = useState('DINAS PENDIDIKAN & KEBUDAYAAN\nSMP / SMA NEGERI 1 NUSANTARA');
  const [schoolAddress, setSchoolAddress] = useState('Jl. Pendidikan No. 45, Telp. (021) 8765432, Website: www.sekolah-nusantara.sch.id');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState('Ganjil');
  const [examDate, setExamDate] = useState('Senin, 15 Desember 2025');
  const [guruPengampu, setGuruPengampu] = useState('Tim MGMP Mata Pelajaran');
  const [fontFamily, setFontFamily] = useState<'Times New Roman' | 'Arial' | 'Calibri'>('Times New Roman');
  const [fontSize, setFontSize] = useState<'11pt' | '12pt'>('12pt');

  // Content toggles
  const [includeKop, setIncludeKop] = useState(true);
  const [includePetunjuk, setIncludePetunjuk] = useState(true);
  const [includeNaskahSoal, setIncludeNaskahSoal] = useState(true);
  const [includeKunciJawaban, setIncludeKunciJawaban] = useState(true);
  const [includeKisiKisi, setIncludeKisiKisi] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');

  // Retrieve questions in this paket
  const paketQuestions: { item: typeof paket.items[0]; question: Question }[] = paket.items
    .map(i => ({
      item: i,
      question: questions.find(q => q.id === i.question_id)!,
    }))
    .filter(pq => pq.question !== undefined);

  // Group by question type
  const pgQuestions = paketQuestions.filter(pq => pq.question.type === 'pg');
  const boolQuestions = paketQuestions.filter(pq => pq.question.type === 'benar_salah');
  const matchQuestions = paketQuestions.filter(pq => pq.question.type === 'menjodohkan');
  const essayQuestions = paketQuestions.filter(pq => pq.question.type === 'uraian');

  // Detect main subject name
  const firstQ = paketQuestions[0]?.question;
  const detectedSubject = subjects.find(s => s.id === firstQ?.subject_id)?.name || 'Mata Pelajaran';
  const detectedCategory = categories.find(c => c.id === paket.kategori_id)?.name || 'Asesmen Sumatif';

  const printRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, true, onClose);

  // Handle Print / PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Generate and Download Word (.doc compatible)
  const handleExportWord = () => {
    try {
      const contentEl = printRef.current;
      if (!contentEl) return;

      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${paket.name}</title>
          <style>
            @page WordSection1 {
              size: 21.0cm 29.7cm;
              margin: 2.0cm 2.0cm 2.0cm 2.0cm;
              mso-header-margin: 36.0pt;
              mso-footer-margin: 36.0pt;
              mso-paper-source: 0;
            }
            div.WordSection1 {
              page: WordSection1;
              font-family: '${fontFamily}', serif;
              font-size: ${fontSize};
              line-height: 1.35;
              color: #000;
            }
            h1, h2, h3, h4 {
              margin: 0;
              padding: 0;
              text-align: center;
              font-family: '${fontFamily}', serif;
            }
            .header-table {
              width: 100%;
              border-bottom: 3px double #000;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 11pt;
            }
            .meta-table td {
              padding: 2px 4px;
              vertical-align: top;
            }
            .table-kisi {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              margin-bottom: 20px;
              font-size: 10pt;
            }
            .table-kisi th, .table-kisi td {
              border: 1px solid #000;
              padding: 5px 8px;
              text-align: left;
            }
            .table-kisi th {
              background-color: #f2f2f2;
              text-align: center;
            }
            .petunjuk-box {
              border: 1px solid #000;
              padding: 8px 12px;
              margin-bottom: 15px;
              font-size: 10.5pt;
            }
            .soal-item {
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .options-grid {
              margin-left: 20px;
              margin-top: 4px;
            }
            .opt-row {
              margin-bottom: 3px;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="WordSection1">
            ${contentEl.innerHTML}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword;charset=utf-8',
      });

      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      const cleanFileName = (paket.name || 'Naskah_Soal').replace(/[^a-zA-Z0-9_\-]/g, '_');
      downloadLink.download = `${cleanFileName}.doc`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      addToast('Naskah soal berhasil diekspor ke format Dokumen Word (.doc)!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal mengekspor dokumen Word.', 'danger');
    }
  };

  let globalQuestionNumber = 1;

  return (
    <div
      id="modal-export-paket-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-export-paket-title"
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden outline-none"
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-export-paket-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ekspor Naskah Soal & Evaluasi
              </h3>
              <p className="text-xs text-slate-500">
                Format standar siap cetak PDF A4 & Ekspor Dokumen Microsoft Word (.doc)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pratinjau Dokumen
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pengaturan Kop & Isi
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Tutup modal ekspor paket soal"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Top Bar */}
        <div className="px-6 py-3 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <span className="font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              {paket.name}
            </span>
            <span className="text-slate-400">|</span>
            <span>{paketQuestions.length} Butir Soal</span>
            <span className="text-slate-400">|</span>
            <span>Waktu: {paket.duration_minutes || 60} Menit</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-word"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" /> Ekspor ke Word (.doc)
            </button>

            <button
              id="btn-export-pdf"
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950/70">
          {activeTab === 'settings' ? (
            /* Settings Tab */
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <School className="w-4 h-4 text-indigo-600" />
                Pengaturan Identitas & Kop Surat Ujian
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Instansi & Sekolah (Kop Surat)
                  </label>
                  <textarea
                    rows={2}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat, Telepon, & Kontak Sekolah
                  </label>
                  <input
                    type="text"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tahun Pelajaran
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                    >
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hari, Tanggal Ujian
                    </label>
                    <input
                      type="text"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Guru Pengampu / Penyusun
                    </label>
                    <input
                      type="text"
                      value={guruPengampu}
                      onChange={(e) => setGuruPengampu(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 pt-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Komponen Dokumen yang Disertakan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeKop}
                    onChange={(e) => setIncludeKop(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Kop Surat & Tabel Identitas</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePetunjuk}
                    onChange={(e) => setIncludePetunjuk(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Petunjuk Pengerjaan Soal</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNaskahSoal}
                    onChange={(e) => setIncludeNaskahSoal(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Naskah Butir Soal Siswa</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeKunciJawaban}
                    onChange={(e) => setIncludeKunciJawaban(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Kunci Jawaban & Pembahasan</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer col-span-full">
                  <input
                    type="checkbox"
                    checked={includeKisiKisi}
                    onChange={(e) => setIncludeKisiKisi(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Matriks Kisi-Kisi & Taksonomi Bloom (C1-C6)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Terapkan & Lihat Pratinjau
                </button>
              </div>
            </div>
          ) : (
            /* Document Preview Tab */
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-xl text-slate-900 border border-slate-200 print:shadow-none print:border-none print:p-0">
              <div
                ref={printRef}
                id="printable-exam-document"
                style={{ fontFamily, fontSize }}
                className="leading-relaxed text-black"
              >
                {/* 1. OFFICIAL SCHOOL KOP */}
                {includeKop && (
                  <div className="text-center border-b-4 border-double border-black pb-3 mb-5">
                    <div className="font-bold text-base sm:text-lg uppercase tracking-wide whitespace-pre-line leading-tight">
                      {schoolName}
                    </div>
                    <div className="text-[11px] text-gray-700 italic mt-1">
                      {schoolAddress}
                    </div>
                  </div>
                )}

                {/* 2. EXAM TITLE & METADATA */}
                {includeKop && (
                  <div className="mb-5">
                    <div className="text-center font-bold text-sm sm:text-base uppercase tracking-wide underline underline-offset-4 mb-3">
                      NASKAH SOAL {detectedCategory.toUpperCase()}
                      <br />
                      TAHUN PELAJARAN {academicYear}
                    </div>

                    <table className="w-full text-xs font-medium border-collapse mb-4">
                      <tbody>
                        <tr>
                          <td className="w-28 py-0.5 font-bold">Mata Pelajaran</td>
                          <td className="w-3">:</td>
                          <td className="w-1/2 py-0.5">{detectedSubject}</td>
                          <td className="w-28 py-0.5 font-bold">Hari, Tanggal</td>
                          <td className="w-3">:</td>
                          <td className="py-0.5">{examDate}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">Kelas / Jenjang</td>
                          <td>:</td>
                          <td className="py-0.5">{paket.jenjang} ({paket.curriculum === 'merdeka' ? 'Kurikulum Merdeka' : 'K13'})</td>
                          <td className="py-0.5 font-bold">Alokasi Waktu</td>
                          <td>:</td>
                          <td className="py-0.5">{paket.duration_minutes || 60} Menit</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">Bentuk Soal</td>
                          <td>:</td>
                          <td className="py-0.5">PG, Menjodohkan, Benar/Salah, Uraian</td>
                          <td className="py-0.5 font-bold">Jumlah Soal</td>
                          <td>:</td>
                          <td className="py-0.5">{paketQuestions.length} Butir</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. PETUNJUK PENGERJAAN */}
                {includePetunjuk && (
                  <div className="border border-black p-3 mb-6 text-xs bg-gray-50/60 rounded">
                    <div className="font-bold mb-1 uppercase tracking-wider">PETUNJUK UMUM:</div>
                    <ol className="list-decimal list-inside space-y-0.5 text-gray-800">
                      <li>Tuliskan identitas nama, kelas, dan nomor peserta Anda pada lembar jawaban yang tersedia.</li>
                      <li>Periksa dan bacalah setiap butir soal dengan teliti sebelum Anda menjawabnya.</li>
                      <li>Dahulukan menjawab soal-soal yang Anda anggap mudah.</li>
                      <li>Untuk soal pilihan ganda, berikan tanda silang (X) atau bulatkan pada pilihan A, B, C, D, atau E yang paling tepat.</li>
                      <li>Periksa kembali seluruh lembar jawaban Anda sebelum diserahkan kepada pengawas ujian.</li>
                    </ol>
                  </div>
                )}

                {/* 4. NASKAH BUTIR SOAL */}
                {includeNaskahSoal && (
                  <div className="space-y-6">
                    {/* BAGIAN I: PILIHAN GANDA */}
                    {pgQuestions.length > 0 && (
                      <div>
                        <div className="font-bold text-xs sm:text-sm uppercase tracking-wide border-b border-black pb-1 mb-3">
                          BAGIAN I: PILIHAN GANDA (Pilihlah salah satu jawaban yang paling tepat!)
                        </div>
                        <div className="space-y-4">
                          {pgQuestions.map(({ item, question }) => {
                            const qNum = globalQuestionNumber++;
                            return (
                              <div key={item.id} className="text-xs break-inside-avoid">
                                <div className="flex gap-2">
                                  <span className="font-bold shrink-0">{qNum}.</span>
                                  <div className="flex-1 whitespace-pre-line text-justify">
                                    {question.question_text}
                                  </div>
                                </div>

                                {question.pg_options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1.5 ml-6">
                                    {question.pg_options.map((opt) => (
                                      <div key={opt.label} className="flex gap-2">
                                        <span className="font-bold">{opt.label}.</span>
                                        <span>{opt.option_text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* BAGIAN II: BENAR / SALAH */}
                    {boolQuestions.length > 0 && (
                      <div className="pt-3">
                        <div className="font-bold text-xs sm:text-sm uppercase tracking-wide border-b border-black pb-1 mb-3">
                          BAGIAN II: PERNYATAAN BENAR ATAU SALAH (Tentukan kebenaran pernyataan berikut!)
                        </div>
                        <div className="space-y-3">
                          {boolQuestions.map(({ item, question }) => {
                            const qNum = globalQuestionNumber++;
                            return (
                              <div key={item.id} className="text-xs break-inside-avoid">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex gap-2 flex-1">
                                    <span className="font-bold shrink-0">{qNum}.</span>
                                    <span className="whitespace-pre-line">{question.question_text}</span>
                                  </div>
                                  <div className="shrink-0 flex items-center gap-3 font-bold border border-black px-2 py-0.5 rounded text-[11px]">
                                    <span>[ &nbsp; ] BENAR</span>
                                    <span>[ &nbsp; ] SALAH</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* BAGIAN III: MENJODOHKAN */}
                    {matchQuestions.length > 0 && (
                      <div className="pt-3">
                        <div className="font-bold text-xs sm:text-sm uppercase tracking-wide border-b border-black pb-1 mb-3">
                          BAGIAN III: MENJODOHKAN (Pasangkan pernyataan pada Kolom A dengan jawaban yang sesuai pada Kolom B!)
                        </div>
                        <div className="space-y-4">
                          {matchQuestions.map(({ item, question }) => {
                            const qNum = globalQuestionNumber++;
                            return (
                              <div key={item.id} className="text-xs break-inside-avoid">
                                <div className="flex gap-2 mb-2">
                                  <span className="font-bold shrink-0">{qNum}.</span>
                                  <span className="font-medium whitespace-pre-line">{question.question_text}</span>
                                </div>

                                {question.matching_pairs && (
                                  <table className="w-full border border-black text-xs ml-4 max-w-xl">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="border border-black p-1 text-center w-12">No</th>
                                        <th className="border border-black p-1 text-left">Kolom A (Pernyataan)</th>
                                        <th className="border border-black p-1 text-left">Kolom B (Pilihan Jawaban)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {question.matching_pairs.map((p, idx) => (
                                        <tr key={p.id}>
                                          <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                                          <td className="border border-black p-1">{p.left_text}</td>
                                          <td className="border border-black p-1">{p.right_text}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* BAGIAN IV: URAIAN / ESAI */}
                    {essayQuestions.length > 0 && (
                      <div className="pt-3">
                        <div className="font-bold text-xs sm:text-sm uppercase tracking-wide border-b border-black pb-1 mb-3">
                          BAGIAN IV: URAIAN & PEMECAHAN MASALAH (Jawablah pertanyaan berikut secara lengkap dan sistematis!)
                        </div>
                        <div className="space-y-5">
                          {essayQuestions.map(({ item, question }) => {
                            const qNum = globalQuestionNumber++;
                            return (
                              <div key={item.id} className="text-xs break-inside-avoid">
                                <div className="flex gap-2">
                                  <span className="font-bold shrink-0">{qNum}.</span>
                                  <div className="flex-1 whitespace-pre-line text-justify">
                                    {question.question_text}
                                  </div>
                                  <span className="text-[11px] italic font-semibold shrink-0">
                                    (Bobot: {item.score} poin)
                                  </span>
                                </div>
                                {/* Dotted lines for student answer writing */}
                                <div className="mt-3 ml-6 space-y-3 print:block hidden">
                                  <div className="border-b border-dotted border-gray-400 h-4" />
                                  <div className="border-b border-dotted border-gray-400 h-4" />
                                  <div className="border-b border-dotted border-gray-400 h-4" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. LEMBAR KUNCI JAWABAN & PEMBAHASAN */}
                {includeKunciJawaban && (
                  <div className="page-break pt-8 mt-8 border-t-2 border-dashed border-black">
                    <div className="text-center font-bold text-sm uppercase tracking-wider underline mb-4">
                      KUNCI JAWABAN & PEDOMAN PENSKORAN ({paket.name})
                    </div>

                    <div className="space-y-4 text-xs">
                      {paketQuestions.map(({ item, question }, idx) => {
                        return (
                          <div key={item.id} className="p-3 border border-black rounded break-inside-avoid bg-gray-50/40">
                            <div className="flex items-center justify-between font-bold pb-1 border-b border-gray-300">
                              <span>
                                Soal No. {idx + 1} ({question.type.toUpperCase()}) - Level {question.level_c} ({question.level_kognitif})
                              </span>
                              <span>Bobot Skor: {item.score}</span>
                            </div>

                            <div className="mt-1.5 space-y-1">
                              {question.type === 'pg' && (
                                <div className="font-bold text-blue-900">
                                  Kunci Jawaban:{' '}
                                  {question.pg_options?.find(o => o.is_correct)?.label || '-'}.{' '}
                                  {question.pg_options?.find(o => o.is_correct)?.option_text || '-'}
                                </div>
                              )}

                              {question.type === 'benar_salah' && (
                                <div className="font-bold text-blue-900">
                                  Kunci Jawaban: {question.correct_boolean ? 'BENAR' : 'SALAH'}
                                </div>
                              )}

                              {question.type === 'menjodohkan' && question.matching_pairs && (
                                <div>
                                  <span className="font-bold text-blue-900">Pasangan Jawaban:</span>
                                  <ul className="list-disc list-inside ml-2">
                                    {question.matching_pairs.map(p => (
                                      <li key={p.id}>{p.left_text} ➔ <b>{p.right_text}</b></li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {question.type === 'uraian' && (
                                <div>
                                  <span className="font-bold text-blue-900">Rubrik / Pedoman Penskoran:</span>
                                  <p className="italic text-gray-800">{question.essay_rubric?.rubric_text || 'Penskoran berdasarkan ketepatan konsep dan kelengkapan langkah kerja.'}</p>
                                </div>
                              )}

                              {question.explanation && (
                                <div className="pt-1 text-gray-700">
                                  <b>Pembahasan:</b> {question.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. MATRIKS KISI-KISI SOAL */}
                {includeKisiKisi && (
                  <div className="page-break pt-8 mt-8 border-t-2 border-dashed border-black">
                    <div className="text-center font-bold text-sm uppercase tracking-wider underline mb-4">
                      MATRIKS KISI-KISI & ANALISIS TAKSONOMI BLOOM
                    </div>

                    <table className="w-full border-collapse border border-black text-[11px]">
                      <thead>
                        <tr className="bg-gray-100 font-bold text-center">
                          <th className="border border-black p-1.5 w-10">No</th>
                          <th className="border border-black p-1.5">Indikator Pencapaian / Soal</th>
                          <th className="border border-black p-1.5 w-20">Bentuk</th>
                          <th className="border border-black p-1.5 w-20">Level Bloom</th>
                          <th className="border border-black p-1.5 w-16">Kognitif</th>
                          <th className="border border-black p-1.5 w-16">Skor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paketQuestions.map(({ item, question }, idx) => (
                          <tr key={item.id}>
                            <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                            <td className="border border-black p-1.5">{question.indicator_text || question.question_text.slice(0, 70) + '...'}</td>
                            <td className="border border-black p-1.5 text-center uppercase">{question.type}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{question.level_c}</td>
                            <td className="border border-black p-1.5 text-center">{question.level_kognitif}</td>
                            <td className="border border-black p-1.5 text-center">{item.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
