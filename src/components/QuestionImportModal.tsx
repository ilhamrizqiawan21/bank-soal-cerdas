import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { BloomLevel, Curriculum, Jenjang, LevelKognitif, Question, QuestionType } from '../types';
import { readSpreadsheetRecords, writeSpreadsheet } from '../lib/spreadsheet';
import { useFocusTrap } from '../lib/useFocusTrap';

interface QuestionImportModalProps {
  onClose: () => void;
}

export const QuestionImportModal: React.FC<QuestionImportModalProps> = ({ onClose }) => {
  const { subjects, importQuestionsData, addToast } = useApp();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<Question>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useFocusTrap(dialogRef, true, onClose);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg(null);

    readSpreadsheetRecords(file)
      .then((rawRows) => {

        if (rawRows.length === 0) {
          setErrorMsg('File spreadsheet kosong atau format sheet tidak valid.');
          return;
        }

        const parsedQuestions: Partial<Question>[] = rawRows.map((row) => {
          const type: QuestionType = (row['Tipe'] || row['tipe'] || 'pg').toLowerCase().includes('uraian')
            ? 'uraian'
            : (row['Tipe'] || row['tipe'] || 'pg').toLowerCase().includes('benar')
            ? 'benar_salah'
            : (row['Tipe'] || row['tipe'] || 'pg').toLowerCase().includes('jodoh')
            ? 'menjodohkan'
            : 'pg';

          const level_c: BloomLevel = (row['Level_Bloom'] || row['bloom'] || 'C2').toUpperCase() as BloomLevel;
          const level_kognitif: LevelKognitif = ['C4', 'C5', 'C6'].includes(level_c) ? 'L3' : level_c === 'C3' ? 'L2' : 'L1';
          const jenjang: Jenjang = (row['Jenjang'] || 'SMP').toUpperCase() as Jenjang;
          const curriculum: Curriculum = (row['Kurikulum'] || 'merdeka').toLowerCase().includes('kbc') ? 'kbc' : 'merdeka';

          const optA = row['Opsi_A'] || row['Pilihan_A'] || 'Opsi A';
          const optB = row['Opsi_B'] || row['Pilihan_B'] || 'Opsi B';
          const optC = row['Opsi_C'] || row['Pilihan_C'] || 'Opsi C';
          const optD = row['Opsi_D'] || row['Pilihan_D'] || 'Opsi D';
          const kunci = (row['Kunci'] || row['Jawaban_Benar'] || 'A').toUpperCase().trim();

          const pg_options = [
            { id: '1', label: 'A', option_text: String(optA), is_correct: kunci === 'A' },
            { id: '2', label: 'B', option_text: String(optB), is_correct: kunci === 'B' },
            { id: '3', label: 'C', option_text: String(optC), is_correct: kunci === 'C' },
            { id: '4', label: 'D', option_text: String(optD), is_correct: kunci === 'D' },
          ];

          return {
            question_text: row['Soal'] || row['Teks_Soal'] || row['Pertanyaan'] || 'Soal tanpa judul',
            indicator_text: row['Indikator'] || '',
            subject_id: subjects[0]?.id,
            type,
            level_c,
            level_kognitif,
            jenjang,
            curriculum,
            explanation: row['Pembahasan'] || '',
            pg_options,
          };
        });

        setPreviewData(parsedQuestions);
      })
      .catch((error) => {
        console.error(error);
        setErrorMsg('Gagal membaca file Excel/CSV. Pastikan format file sesuai.');
      });
  };

  const handleDownloadTemplate = async () => {
    const templateData = [
      {
        Soal: 'Berapakah hasil dari 15 × 8 + 40?',
        Tipe: 'pg',
        Jenjang: 'SMP',
        Kurikulum: 'merdeka',
        Level_Bloom: 'C3',
        Opsi_A: '120',
        Opsi_B: '160',
        Opsi_C: '150',
        Opsi_D: '140',
        Kunci: 'B',
        Indikator: 'Peserta didik dapat menyelesaikan operasi hitung campuran bilangan bulat',
        Pembahasan: '15 × 8 = 120, lalu 120 + 40 = 160.',
      },
      {
        Soal: 'Sebutkan organ utama sistem ekskresi pada manusia dan fungsinya!',
        Tipe: 'uraian',
        Jenjang: 'SMP',
        Kurikulum: 'merdeka',
        Level_Bloom: 'C2',
        Opsi_A: '',
        Opsi_B: '',
        Opsi_C: '',
        Opsi_D: '',
        Kunci: '',
        Indikator: 'Peserta didik mampu mendeskripsikan fungsi organ ginjal dan kulit',
        Pembahasan: 'Ginjal menyaring darah dan menghasilkan urine.',
      },
    ];

    try {
      await writeSpreadsheet(templateData, 'Template_Import_Bank_Soal_Cerdas.xlsx', 'TemplateSoal');
      addToast('Template Excel berhasil diunduh.', 'info');
    } catch (error) {
      console.error(error);
      addToast('Gagal mengunduh template Excel.', 'danger');
    }
  };

  const handleProcessImport = async () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);
    try {
      await importQuestionsData(previewData, selectedFile);
      onClose();
    } catch (e) {
      addToast('Terjadi kesalahan saat memproses import soal.', 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="modal-import-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      role="presentation"
    >
      <div
        ref={dialogRef}
        id="modal-import"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-import-title"
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 outline-none"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 id="modal-import-title" className="text-base font-bold text-slate-900 dark:text-white">Import Soal dari Spreadsheet</h3>
              <p className="text-xs text-slate-400">Dukungan format Excel (.xlsx, .xls) dan CSV</p>
            </div>
          </div>
          <button
            id="btn-close-import-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup modal import soal"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Download Template Alert */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 flex items-center justify-between gap-4">
            <div className="text-xs text-blue-900 dark:text-blue-200">
              <p className="font-bold mb-0.5">Unduh Contoh Template Format</p>
              <p className="text-blue-700 dark:text-blue-300">
                Gunakan template standar agar pemetaan Taksonomi Bloom dan opsi jawaban tepat.
              </p>
            </div>
            <button
              id="btn-download-template-excel"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Unduh Template
            </button>
          </div>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center transition-colors">
            <input
              id="file-upload-input"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload-input"
              className="flex flex-col items-center justify-center cursor-pointer gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : 'Klik untuk memilih file atau seret file ke sini'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Format file yang didukung: XLSX, XLS, CSV</p>
              </div>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Preview Parsed Rows */}
          {previewData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pratinjau Data ({previewData.length} Soal Terbaca)
                </h4>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/40">
                {previewData.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="truncate max-w-[280px] font-medium text-slate-800 dark:text-slate-200">
                      {idx + 1}. {item.question_text}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 text-[10px] font-bold">
                        {item.level_c}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
                {previewData.length > 5 && (
                  <p className="text-[11px] text-center text-slate-400 pt-1">
                    ... dan {previewData.length - 5} soal lainnya
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-import"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            id="btn-confirm-import"
            disabled={previewData.length === 0 || isProcessing}
            onClick={handleProcessImport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
          >
            {isProcessing ? 'Mengimpor...' : `Simpan ${previewData.length} Soal ke Bank`}
          </button>
        </div>
      </div>
    </div>
  );
};
