import Alpine from 'alpinejs';

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
    // Tipe soal
    type: 'pg',
    
    // PG Options
    options: ['', '', '', ''],
    correctOption: 0,
    
    // Matching Pairs
    matchingPairs: [
        { left: '', right: '' },
        { left: '', right: '' },
        { left: '', right: '' }
    ],
    
    // Essay
    essayRubric: '',
    
    // Benar/Salah
    correctBoolean: true,
    
    // KKO Options (akan diisi via API)
    kkoOptions: [],
    
    // ===== METHODS =====
    addPair() {
        this.matchingPairs.push({ left: '', right: '' });
    },
    
    removePair(index) {
        if (this.matchingPairs.length > 1) {
            this.matchingPairs.splice(index, 1);
        }
    },
    
    loadKKO(level) {
        if (!level) return;
        
        fetch(`/api/kko/${level}`)
            .then(response => response.json())
            .then(data => {
                this.kkoOptions = data;
            })
            .catch(error => console.error('Error loading KKO:', error));
    },
    
    // ===== COMPUTED =====
    get isPG() { return this.type === 'pg'; },
    get isUraian() { return this.type === 'uraian'; },
    get isMenjodohkan() { return this.type === 'menjodohkan'; },
    get isBenarSalah() { return this.type === 'benar_salah'; },
}));

// ============ SIDEBAR TOGGLE ============
Alpine.data('sidebar', () => ({
    open: window.innerWidth > 768,
    
    toggle() {
        this.open = !this.open;
    },
    
    init() {
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.open = true;
            } else {
                this.open = false;
            }
        });
    }
}));

Alpine.start();