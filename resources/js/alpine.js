import Alpine from 'alpinejs';
import './alpine/toast';

window.Alpine = Alpine;

// ============ FILTER SOAL ============
Alpine.data('questionFilter', () => ({
    curriculum: 'semua',
    level: 'semua',
    type: 'semua',
    kko: 'semua',
    search: '',
    
    applyFilter() {
        this.$dispatch('filter-applied', {
            curriculum: this.curriculum,
            level: this.level,
            type: this.type,
            kko: this.kko,
            search: this.search
        });
    },
    
    resetFilter() {
        this.curriculum = 'semua';
        this.level = 'semua';
        this.type = 'semua';
        this.kko = 'semua';
        this.search = '';
        this.applyFilter();
    }
}));

// ============ FORM TAMBAH SOAL ============
Alpine.data('questionForm', () => ({
    // ===== STATE =====
    type: '',
    level: '',
    options: ['', '', '', ''],
    correctOption: 0,
    matchingPairs: [
        { left: '', right: '' },
        { left: '', right: '' },
        { left: '', right: '' }
    ],
    essayRubric: '',
    correctBoolean: false,
    kkoOptions: [],
    
    // ===== METHODS =====
    addOption() {
        if (this.options.length < 5) {
            this.options.push('');
        }
    },

    removeOption(index) {
        if (this.options.length > 4) {
            this.options.splice(index, 1);
        }
    },

    addPair() {
        this.matchingPairs.push({ left: '', right: '' });
    },
    
    removePair(index) {
        if (this.matchingPairs.length > 1) {
            this.matchingPairs.splice(index, 1);
        }
    },
    
    loadKKO(level) {
        if (!level) {
            this.kkoOptions = [];
            return;
        }
        
        fetch(`/api/kko/${level}`)
            .then(response => response.json())
            .then(data => {
                this.kkoOptions = data.data || data;
            })
            .catch(error => console.error('Error loading KKO:', error));
    },
    
    // ===== COMPUTED =====
    get isPG() { return this.type === 'pg'; },
    get isUraian() { return this.type === 'uraian'; },
    get isMenjodohkan() { return this.type === 'menjodohkan'; },
    get isBenarSalah() { return this.type === 'benar_salah'; },
}));

// ============ APLIKASI KERJAKAN UJIAN ============
Alpine.data('ujianApp', (questions = [], deadline = null, ujianId = null) => ({
    questions,
    deadline,
    ujianId,
    currentIndex: 0,
    jawaban: {},
    timeLeft: 0,
    saveTimer: null,

    init() {
        this.questions.forEach((q) => {
            this.jawaban[q.id] = {
                selected_option: null,
                jawaban: q.type === 'menjodohkan' ? {} : '',
            };
        });

        // Dipakai oleh script submit ujian (keamanan) untuk flush jawaban terakhir
        window.__ujianState = {
            jawaban: this.jawaban,
            flush: () => this.saveJawabanNow(),
        };

        if (this.deadline) {
            this.timeLeft = Math.max(0, Math.floor(this.deadline - Date.now() / 1000));
            setInterval(() => {
                this.timeLeft = Math.max(0, Math.floor(this.deadline - Date.now() / 1000));
                if (this.timeLeft === 0) {
                    window.submitUjian?.(true);
                }
            }, 1000);
        }
    },

    get currentQuestion() {
        return this.questions[this.currentIndex] || null;
    },

    get progress() {
        if (!this.questions.length) return 0;
        const answered = this.questions.filter((q) => this.isAnswered(q)).length;
        return Math.round((answered / this.questions.length) * 100);
    },

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(s);
    },

    isAnswered(q) {
        const j = this.jawaban[q.id];
        if (!j) return false;
        if (q.type === 'pg' || q.type === 'benar_salah') return j.selected_option !== null;
        if (q.type === 'menjodohkan') {
            return Object.values(j.jawaban || {}).some((v) => v !== '' && v != null);
        }
        return !!j.jawaban;
    },

    selectOption(index) {
        this.jawaban[this.currentQuestion.id].selected_option = index;
        this.saveJawaban();
    },

    selectBoolean(value) {
        this.jawaban[this.currentQuestion.id].selected_option = value;
        this.saveJawaban();
    },

    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
    },

    previousQuestion() {
        if (this.currentIndex > 0) this.currentIndex--;
    },

    goToQuestion(index) {
        if (index >= 0 && index < this.questions.length) this.currentIndex = index;
    },

    submit() {
        window.submitUjian?.();
    },

    saveJawaban() {
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveJawabanNow(), 800);
    },

    saveJawabanNow() {
        clearTimeout(this.saveTimer);
        if (!this.ujianId) return Promise.resolve();

        const payload = {};
        for (const qid of Object.keys(this.jawaban)) {
            const q = this.questions.find((x) => String(x.id) === qid);
            const j = this.jawaban[qid];
            payload[qid] = {
                selected_option: j.selected_option,
                jawaban: q?.type === 'menjodohkan'
                    ? JSON.stringify(j.jawaban || {})
                    : (j.jawaban ?? ''),
            };
        }

        return fetch(`/ujian/${this.ujianId}/jawaban`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ jawaban: payload }),
        });
    },
}));

Alpine.start();