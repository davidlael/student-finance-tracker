import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';
class State {
    constructor() {
        this.records = loadRecords();
        this.settings = loadSettings();
        this.searchQuery = '';
        this.isCaseSensitive = false;
        this.sortCriteria = 'date-desc';
    }
    setRecords(recs){ this.records = recs; saveRecords(recs); }
    addRecords(rec){ this.records.unshift(rec); saveRecords(this.records); }
    updateRecords(rec){ this.records = this.records.map(r => r.id === rec.id ? rec : r); saveRecords(this.records); }
    deleteRecords(id){ this.records = this.records.filter(r => r.id !== id); saveRecords(this.records); }
    updateSettings(set) { this.settings = { ...this.settings, ...set }; saveSettings(this.settings); }
}
export const appState = new State();