export const validateDescription = (val) => {
    const ok = /^\S(?:.*\S)?$/.test(val);
    return {valid: ok, message: ok? '': 'No leading/trailing spaces allowed.'};
};
export const validateAmount = (val) => {
    const ok = /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(String(val).trim());
    return {valid: ok, message: ok ? '' : 'Enter valid amount (e.g., 12.50).' };
};
export const validateDate = (val) => {
    const ok = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(val);
    return {valid: ok, message: ok ? '' : 'Format must be YYYY-MM-DD.'};
};
export const validateCategory = (val) => {
    const ok = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(val);
    return {valid: ok, message: ok ? '' : 'Letters and hyphens only.' };
};
export const hasDuplicateWords = (text) => /\b(\w+)\s+\1\b/i.test(text);