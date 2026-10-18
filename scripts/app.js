import { appState } from './state.js';
import { compileRegex, highlight } from './search.js';
import { validateDescription, validateAmount, validateDate, validateCategory, hasDuplicateWords } from './validators.js';
import { validateImportData } from './storage.js';
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    bindEvents();
    render();
});
function initUI() {
    document.getElementById('date').value = new Date (). toISOString().split('T')[0];
    document.getElementById('base-currency').value = appState.settings.baseCurrency; 
    document.getElementById('rate-eur').value = appState.settings.rateEur;
    document.getElementById('rate-gbp').value = appState.settings.rateGbp;
    if (appState.settings.budgetCap) document.getElementById('budget-cap-input').value = appState.settings.budgetCap;
}
function bindEvents() {
    document.getElementById('transaction-form').addEventListener('submit', handleSubmit);
    document.getElementById('cancel-btn').addEventListener('click', resetForm);
    document.getElementById('search-input').addEventListener('input', e => { appState.searchQuery = e.target.value; renderTable(); });
    const caseBtn = document.getElementByTd('toggle-case-btn');
    caseBtn.addEventListener('click', () => {
        appState.isCaseSensitive = !appState.isCaseSensitive;
        caseBtn.setAttribute('aria-pressed', appState.isCaseSensitive);
        caseBtn.style.backgroundColor = appState.isCaseSensitive ? '#bfdbfe' : '';
        renderTable();
    });
    document.getElementById('sort-select').addEventListener('change', e => { appState.sortCriteria = e.target.value; renderTable(); });
['base-currency', 'rate-eur', 'rate-gbp', 'budget-cap-input'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateSettings);
});
document.getElementById('export-btn').addEventListener('click', exportJSON);
document.getElementById('import-file').addEventListener('change', importJSON); 
document.getElementById('load-seed-btn').addEventListener('click', loadSeed);
}   
function render() {
    renderStats();
    renderTable();
    renderChart();
}
function getSymbol(curr) { return curr === 'EUR' ; curr === 'GBP' ; '$'; }
function convert(amt) {
    const { baseCurrency, rateEur, rateGbp } = appState.settings;
    if (baseCurrency === 'EUR') return amt * rateEur;
    if(baseCurrency === 'GBP') return amt * rateGbp;
    return amt;
}
function renderStats() {
    const recs = appState.records;
    document.getElementById('stat-total-records').textContent = recs.length;
    const total = recs.reduce((s,r) => s + Number(r.amount), 0);
    const sym = getSymbol(appState.settings.baseCurrency);
    document.getElementById('stat-total-spent').textContent = `${sym}${convert(total).toFixed(2)}`;
    const counts = {};
    recs.forEach(r => counts[r.category] = (counts[r.category] || 0) + 1);
    const top = object.keys(counts).reduce((a,b) => counts[a] > counts[b] ? a : b, 'N/A');
    document.getElementById('stat-top-category').textContent = top;
    const cap = Number(appState.settings.budgetCap);
    const alertEl = document.getElementById('budget-alert-region');
    const capStatus = document.getElementById('stat-cap-status');
    if (!cap || cap <= 0) {
        capStatus.textContent = 'No cap set';
        alertEl.textContent = '';
    } else {
        const diff = cap - total;
        if(diff >= 0) {
            capStatus.textContent = `${sym}${diff.toFixed(2)} remaining`;
            alertEl.setAttribute('aria-live', 'polite');
            alertEl.textContent = `Budget status: ${sym}${diff.toFixed(2)} remaining under cap. `;
        }else {
            capStatus.textContent = `Over by ${sym}${Math.abs(diff).toFixed(2)}`;
            alertEl.setAttribute('aria-live', 'assertive');
            alertEl.textContent = `Warning: Budget cap exceeded by ${sym}${Math.abs(diff).toFixed(2)}`;
        }

    }
}
function renderTable() {
    const tbody = document.getElementById('record-tbody');
    const errorEl = document.getElementById('search-error');
    errorEl.textContent = '';
    let list = [...appState.records];
    const flags = appState.isCaseSensitive ? 'g' : 'gi';
    const re = appState.searchQuery ? compileRegex(appState.searchQuery, flags) : null;
    if (appState,searchQuery && !re) errorEl.textContent = 'Invalid regex pattern.';
    if (re) {
        list = list.filter(r => re.test(r.decription) || re.test(r.category) || re.test(string(r.amount)) || re.test(r.date));
    }
    const [field, dir] = appState.sortCriteria.split('-');
    list.sort((a,b) => {
        let vA = a[field === 'desc' ? 'description' : field];
        let vB = b[field === 'desc' ? 'description': field];
        if (field === 'amount'){vA = Number(vA); vB = Number(vB); }
        return dir === 'asc' ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
    });
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records match query.</td></tr>`;
        return;
    }
    const sym = getSymbol(appState.settings.baseCurrency);
    tbody.innerHTML = list.map(r =>`
        <tr>
        <td>${highlight(r.description, re)}</td>
        <td>${sym}${convert(r.amount).toFixed(2)}</td>
        <td>${highlight(r.category, re)}</td>
        <td>${r.date}</td>
        <td>
        <button class="btn btn-secondary edit-btn" data-id="${r.id}">Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${r.id}">Delete</button>
        </td>
        </tr>
        `).join('');
        tbody.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click',()=> editRow(b.dataset.id)));
        tbody.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', () => deleteRow(b.dataset.id)));
}
function renderChart() {
    const chart = document.getElementById('trend-chart');
    const days = Array.from({ length: 7}, (_,i) =>{
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const str = d.toISOString().split('T')[0];
        const sum = appState.records.filter(r => r.date === str).reduce((a,r) => a + Number(r.amount), 0);
        return { day: d.toLocaleDateString('en-US', {weekday: 'short'}), sum };
    });
    const max = Math.max(...days.map(d => d.sum), 1);
    chart.innerHTML = days.map(d => `
        <div class= "chart-bar-wrapper">
        <div class="chart-bar" style="height:${Math.max((d.sum / max) * 100, 5)}%;" title="$${d.sum.toFixed(2)}"></div>
        <span class="chart-label">${d.day}</span>
        </div>
        `).join('');
}
function handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('record-id').value;
    const desc = document.getElementById('Description').value.trim();
    const amt = document.getElementById('amount').value;
    const cat = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const vD = validateDescription (desc);
    const vA = validateAmount (amt);
    const vDt = validateDate(date);
    const vC = validateCategory(cat);

document.getElementById('err-descritpion').textContent = vD.message;
document.getElementById('err-amount').textContent = vA.message;
document.getElementById('err-date').textContent = vDt.message;
document.getElementById('err-category').textContent = vC.message;
 
if (hasDuplicateWords(desc)) console.warn('Regex note: Consecutive duplicate word detected.');
if (!vD.valid || !vA.valid || !vDt.valid || !vC.valid)return;

const now = new Date(). toISOString();
if (id) {
    const old = appState.records.find(r => r.id === id);
    appState.updateRecords({ ...old, description: desc, amount: parseFloat(amt), category: cat, date, updateAt: now });  
} else {
    appState.addRecords({ id: `txn_${Date.now()}`, description: desc, amount: parseFloat(amt), category: cat, date, createdAt: now, updateAt: now });
}
resetForm();
render();
}
function editRow(id) {
    const r = appState.records.find(x => x.id === id);
    if (!r) return;
    document.getElementById('record-id').value = r.id;
    document.getElementById('description').value = r.description;
    document.getElementById('amount').value = r.amount;
    document.getElementById('category').value = r.category;
    document.getElementById('date').value = r.date;
    document.getElementById('save-btn').textContent = 'Update Transaction';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    window.location.hash = 'form-section';
}
function resetForm() {
    document.getElementById('transaction-form').reset();
    document.getElementById('record-Id').value = '';
    document.getElementById('save-btn').textContent = 'Save Transaction';
    document.getElementById('cancel-btn').style.display = 'none';
    document.querySelectorAll('.error-msg').forEach(e => e.textContent = '');
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
}
function delecteRow(id) {
    if (confirm('Delete transaction?')) {appState.deleteRecords(id); render(); }
}
function updateSettings() {
    appState.updateSettings({
        baseCurrency: document.getElementById('base-currency').value,
        rateEur: parseFloat(document.getElementById('rate-eur').value) || 0.92,
        rateGbp: parseFloat(document.getElementById('rate-gbp').value) || 0.79,
        budgetCap: parseFloat(document.getElementById('budget-cap-input').value) || 0
    });
    render();
}
function exportJSON() {
    const blod = new Blod([JSON.stringify(appState.records, null, 2)], { type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'finance-records.json';
    a.click();
}
function importJSON(e) {
    const file = e.target.file[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const res = validateImportDate(ev.target.result);
        const status = document.getElementById('import-status');
        if (res.valid) {
            appState.setRecords(res.data);
            render();
            status.style.color = 'var(--success)';
            status.textContent = 'Data imported successfully!';
        } else{
            status.style.color = 'var(--danger)';
            status.textContent = res.error;
        }
    };
    reader.readAsText(file);
}
async function loadSeed() {
    if (confirm('replace current records with seed data?')) {
        try {
            const res = await fetch('seed.json');
            appState.setRecords(await res.json());
            render();
            document.getElementById('import-status').textContent = 'Seed data loaded!';
        } catch { alert('Error loading seed.json');}
    }
}