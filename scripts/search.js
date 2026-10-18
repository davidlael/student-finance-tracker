export const compileRegex = (input, flags = 'i') => {
    try {return input ? new RegExp(input, flags) : null; }
    catch  {return null; }
};
const escapeHTML = (s) => String(s).replace(/[&<>'']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;','"': '&quot;', "'": '&#039;' }[m]));
export const highlight = (text, re) => {
    if (!re || !text) return escapeHTML(text);
    try{
        return String(text).replace(re, m => `<mark>${escapeHTML (m)}</mark>`);
    }
    catch{
        return escapeHTML(text);
    }
};