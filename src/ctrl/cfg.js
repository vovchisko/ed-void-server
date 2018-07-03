class CFG_Browser {
    constructor() {
        this.api_key = '';
        this.c_mode = 'cfg';
        this.ui_font_size = '100%';
        this.ui_fx_level = 'full';
        this.dev = false;
        this.email = '';
        this.valid = false;
        this.load();
    }

    load() {
        this.api_key = (localStorage.getItem('api_key')) || this.api_key;
        this.c_mode = (localStorage.getItem('c_mode')) || this.c_mode;
        this.ui_font_size = (localStorage.getItem('ui_font_size')) || this.ui_font_size;
        this.ui_fx_level = (localStorage.getItem('ui_fx_level')) || this.ui_fx_level;
        this.apply_ui_cfg();

    }

    save() {
        localStorage.setItem('api_key', this.api_key);
        localStorage.setItem('c_mode', this.c_mode);
        localStorage.setItem('ui_font_size', this.ui_font_size);
        localStorage.setItem('ui_fx_level', this.ui_fx_level);
    }

    apply_ui_cfg() {
        document.body.style.fontSize = this.ui_font_size;
        document.body.className = 'edfx-lv-' + this.ui_fx_level;
    }
}

const CFG = new CFG_Browser();

export default CFG;