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
    correctBoolean: initialCorrectBoolean,
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

// ============ SIDEBAR TOGGLE ============
Alpine.data('sidebar', () => ({
    open: true,
    collapsed: false,

    toggle() {
        if (window.innerWidth < 992) {
            this.open = !this.open;
            return;
        }

        this.collapsed = !this.collapsed;
    },

    init() {
        const syncLayout = () => {
            if (window.innerWidth < 992) {
                this.open = false;
                this.collapsed = false;
            } else {
                this.open = true;
            }
        };

        syncLayout();
        window.addEventListener('resize', syncLayout);
    }
}));

Alpine.start();