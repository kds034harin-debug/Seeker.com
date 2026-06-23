function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getTypeLabel(type) {
    const labels = {
        movie: "ФИЛЬМ",
        series: "СЕРИАЛ",
        game: "ИГРА",
        book: "КНИГА"
    };
    return labels[type] || "КОНТЕНТ";
}

function getLinksByType(item) {
    let links = [];
    
    if (item.type === "movie" || item.type === "series") {
        if (item.links?.watch) links.push({ text: "Смотреть", url: item.links.watch });
    } else if (item.type === "game") {
        if (item.links?.buy) links.push({ text: "Купить", url: item.links.buy });
    } else if (item.type === "book") {
        if (item.links?.buy) links.push({ text: "Купить", url: item.links.buy });
    }
    
    if (links.length === 0) {
        links.push({ text: "Подробнее", url: "#" });
    }
    
    return links;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}