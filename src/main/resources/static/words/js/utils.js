export function showToast(msg, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
}

export function formatDateBR(isoDate) {
    if (!isoDate) return '';
    return isoDate.split('-').reverse().join('/');
}
