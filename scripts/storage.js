const REC_KEY = 'app:finance_data';
const SET_KEY = 'app:finance_settings';

export const loadRecords = () => {
    try{ return JSON.parse(localStorage.getItem(REC_KEY)) || []; }
    catch{return []; }
};

export const saveRecords = (data) => localStorage.setItem(REC_KEY, JSON.stringify(data));

export const loadSettings = () => {
    const def = {baseCurrency: 'USD', rateEur: 0.92, rateGbp: 0.79, budgetCap: 0 };
    try{ return {...def, ...JSON.parse(localStorage.getItem(SET_KEY)) }; }
    catch {return def; }
};

export const saveSettings = (data) => localStorage.setItem(SET_KEY, JSON.stringify(data));

export const validateImportData = (str) => {
    try{
        const data = JSON.parse(str);
        if(!Array.isArray(data)) return {valid: false, error: 'JSON must be an array.'};
        const valid = data.every(r => r.id && r.description && typeof r.amount === 'number' && r.date);
        return valid ? {valid: true, data} : {valid: false, error: 'Invalid record schema.' };
    }
    catch{
        return{valid: false, error: 'syntax error in JSON file.' };
    }
};