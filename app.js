
// ========== ИНИЦИАЛИЗАЦИЯ ==========
let searchInput, searchBtn, resultsContainer, resultsStatsBlock, newsSection;
let currentCategory = "all";
let currentPage = "home";
let currentQuery = "";
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let favoriteNews = JSON.parse(localStorage.getItem('favoriteNews') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let isAdmin = localStorage.getItem('isAdmin') === 'true';

const modal = document.getElementById('authModal');

// ========== НОВОСТИ ==========
let newsDatabase = JSON.parse(localStorage.getItem('seeker_news')) || [
    { id: 1, category: "Игры", title: "Valorant: вышел патч 8.11 с новым агентом", description: "Riot Games представила сбалансированные изменения и свежего стража.", date: new Date().toLocaleString(), url: "https://playvalorant.com/ru-ru/news/" },
    { id: 2, category: "Игры", title: "The International 2024: рекордный призовой фонд", description: "Турнир по Dota 2 соберет лучшие команды мира.", date: new Date(Date.now() - 24*60*60*1000).toLocaleString(), url: "https://www.dota2.com/esports/ti13/" },
    { id: 3, category: "Сериалы", title: "Новый сериал по Гарри Поттеру: первые детали", description: "HBO раскрыл планы на 7 сезонов с новым актерским составом.", date: new Date(Date.now() - 5*60*60*1000).toLocaleString(), url: "https://www.hbo.com/harry-potter" },
    { id: 4, category: "Фильмы", title: "Дьявол носит Prada 2 официально анонсирован", description: "Мерил Стрип и Энн Хэтэуэй могут вернуться к своим ролям.", date: new Date(Date.now() - 2*24*60*60*1000).toLocaleString(), url: "https://www.kinopoisk.ru/film/devil-wears-prada-2/" },
    { id: 5, category: "Книги", title: "Новая книга о Гарри Поттере выйдет в 2025", description: "Джоан Роулинг работает над расширением магической вселенной.", date: new Date(Date.now() - 4*24*60*60*1000).toLocaleString(), url: "https://www.bloomsbury.com/uk/discover/harry-potter/" },
    { id: 6, category: "Игры", title: "CD Projekt RED анонсировала новую игру во вселенной Ведьмака", description: "Студия подтвердила разработку следующей части саги на Unreal Engine 5.", date: new Date(Date.now() - 3*24*60*60*1000).toLocaleString(), url: "https://www.thewitcher.com/ru/" },
    { id: 7, category: "Фильмы", title: "Дюна 2 собрала 700 миллионов долларов в прокате", description: "Продолжение эпической саги Дени Вильнёва продолжает бить рекорды.", date: new Date(Date.now() - 1*24*60*60*1000).toLocaleString(), url: "https://www.kinopoisk.ru/film/dyuna-chast-vtoraya-2024/" },
    { id: 8, category: "Сериалы", title: "The Last of Us 2 сезон: дата выхода и подробности", description: "HBO Max раскрыл первые кадры второго сезона.", date: new Date(Date.now() - 6*60*60*1000).toLocaleString(), url: "https://www.hbo.com/the-last-of-us" }
];

function saveNewsToStorage() {
    localStorage.setItem('seeker_news', JSON.stringify(newsDatabase));
}

function saveFavoritesToStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('favoriteNews', JSON.stringify(favoriteNews));
}

// ========== ФУНКЦИИ ИЗБРАННОГО ==========
function toggleFavorite(itemId, type) {
    if (!currentUser) {
        alert("Войдите в аккаунт!");
        openModal();
        return false;
    }
    
    if (type === 'news') {
        if (favoriteNews.includes(itemId)) {
            favoriteNews = favoriteNews.filter(id => id !== itemId);
            showToast("Новость удалена из избранного");
        } else {
            favoriteNews.push(itemId);
            showToast("Новость добавлена в избранное");
        }
        saveFavoritesToStorage();
        renderNews();
    } else {
        if (favorites.includes(itemId)) {
            favorites = favorites.filter(id => id !== itemId);
            showToast("Удалено из избранного");
        } else {
            favorites.push(itemId);
            showToast("Добавлено в избранное");
        }
        saveFavoritesToStorage();
        if (currentPage === "search" && currentQuery) {
            performSearch();
        } else if (currentPage === "home") {
            renderCards(contentDatabase);
        } else if (currentPage === "favorites") {
            renderFavoritesPage();
        }
    }
    return true;
}

function isFavorite(itemId, type) {
    if (type === 'news') return favoriteNews.includes(itemId);
    return favorites.includes(itemId);
}

// ========== НЕДАВНИЕ ПРОСМОТРЫ ==========
const MAX_RECENT_ITEMS = 15;

function addToRecent(itemId, itemType, itemData) {
    if (!currentUser) return;
    let recentItems = JSON.parse(localStorage.getItem(`recent_${currentUser.email}`) || '[]');
    recentItems = recentItems.filter(item => item.id !== itemId);
    recentItems.unshift({
        id: itemId,
        type: itemType,
        title: itemData.title,
        category: itemData.category || itemData.type,
        image: itemData.image || null,
        url: itemData.url || itemData.links?.watch || itemData.links?.buy,
        date: new Date().toLocaleString()
    });
    if (recentItems.length > MAX_RECENT_ITEMS) recentItems = recentItems.slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(`recent_${currentUser.email}`, JSON.stringify(recentItems));
}

function getRecentItems() {
    if (!currentUser) return [];
    return JSON.parse(localStorage.getItem(`recent_${currentUser.email}`) || '[]');
}

function addCurrentToRecent(itemId, itemType) {
    if (!currentUser) return;
    let itemData = null;
    if (itemType === 'news') {
        const news = newsDatabase.find(n => n.id == itemId);
        if (news) itemData = { title: news.title, category: news.category, url: news.url };
    } else {
        const content = contentDatabase.find(c => c.id == itemId);
        if (content) itemData = { title: content.title, type: content.type, image: content.image, url: content.links?.watch || content.links?.buy };
    }
    if (itemData) addToRecent(itemId, itemType, itemData);
}

// ========== ОТРИСОВКА НОВОСТЕЙ ==========
function renderNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    const isAdminUser = isAdmin || (currentUser && currentUser.email === 'admin@seeker.com');
    
    newsContainer.innerHTML = newsDatabase.map(news => {
        const isFav = isFavorite(news.id, 'news');
        return `
            <div class="news-card">
                <div class="news-header">
                    <span class="news-category">${escapeHtml(news.category)}</span>
                    <span class="news-date">${escapeHtml(news.date)}</span>
                    ${currentUser ? `<button class="favorite-star-btn ${isFav ? 'active' : ''}" data-id="${news.id}" data-type="news" onclick="event.stopPropagation(); toggleFavorite(${news.id}, 'news')">${isFav ? '★' : '☆'}</button>` : ''}
                    ${isAdminUser ? `<button class="edit-news-btn" data-id="${news.id}" style="background:#f0f0f0; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:10px;" onclick="editNewsModal(${news.id})">Ред</button>
                    <button class="delete-news-btn" data-id="${news.id}" style="background:#f0f0f0; border:1px solid #ebebeb; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:10px; color:#c0392b;" onclick="if(confirm('Удалить?')){ newsDatabase = newsDatabase.filter(n=>n.id!==${news.id}); saveNewsToStorage(); renderNews(); }">Удал</button>` : ''}
                </div>
                <div class="news-title" onclick="addCurrentToRecent(${news.id}, 'news'); window.open('${news.url}', '_blank')">${escapeHtml(news.title)}</div>
                <div class="news-desc">${escapeHtml(news.description)}</div>
                <div class="news-link" onclick="addCurrentToRecent(${news.id}, 'news'); window.open('${news.url}', '_blank')">Читать подробнее →</div>
            </div>
        `;
    }).join('');
}

function editNewsModal(id) {
    const news = newsDatabase.find(n => n.id === id);
    if (!news) return;
    const newTitle = prompt("Заголовок:", news.title);
    if (!newTitle) return;
    const newDesc = prompt("Описание:", news.description);
    if (!newDesc) return;
    news.title = newTitle;
    news.description = newDesc;
    news.date = new Date().toLocaleString();
    saveNewsToStorage();
    renderNews();
    showToast("Новость обновлена!");
}

function showAddNewsModal() {
    const category = prompt("Категория (Игры/Фильмы/Сериалы/Книги):", "Игры");
    if (!category) return;
    const title = prompt("Заголовок:");
    if (!title) return;
    const description = prompt("Описание:");
    if (!description) return;
    const url = prompt("Ссылка:", "https://");
    newsDatabase.unshift({
        id: Date.now(),
        category: category,
        title: title,
        description: description,
        date: new Date().toLocaleString(),
        url: url || "#"
    });
    saveNewsToStorage();
    renderNews();
    showToast("Новость добавлена!");
}

// ========== ОТРИСОВКА КАРТОЧЕК ==========
function renderCards(items) {
    if (!items || !items.length) {
        resultsContainer.innerHTML = `<div class="empty-state">Ничего не найдено</div>`;
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    document.getElementById('resultCount').innerText = items.length;

    resultsContainer.innerHTML = items.map(item => {
        const typeLabel = getTypeLabel(item.type);
        const links = getLinksByType(item);
        let imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
        const isFav = isFavorite(item.id, 'content');
        
        return `
            <div class="result-card" data-id="${item.id}" data-type="${item.type}">
                <div class="card-image" style="background-image: url(${imageUrl});"></div>
                <div class="card-content">
                    <div class="card-header">
                        <span class="content-type">${typeLabel}</span>
                        <span class="year-rating">${item.year || ''} ${item.rating ? '| ' + item.rating : ''}</span>
                        ${currentUser ? `<button class="favorite-star-btn ${isFav ? 'active' : ''}" data-id="${item.id}" data-type="content" onclick="event.stopPropagation(); toggleFavorite(${item.id}, 'content')">${isFav ? '★' : '☆'}</button>` : ''}
                    </div>
                    <div class="title">${escapeHtml(item.title)}</div>
                    <div class="description">${escapeHtml((item.description || '').substring(0, 150))}${(item.description || '').length > 150 ? '...' : ''}</div>
                    <div class="links-section">${links.map(link => `<a href="${link.url}" target="_blank" class="link-btn">${link.text}</a>`).join('')}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.favorite-star-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.id, btn.dataset.type);
        };
    });
    
    document.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
            addCurrentToRecent(parseInt(card.dataset.id), card.dataset.type);
        });
    });
}

// ========== ПОИСК ==========
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    currentQuery = searchTerm;
    
    const newsSectionElem = document.getElementById('newsSection');
    const resultsContainerElem = document.getElementById('resultsContainer');
    const resultsStatsElem = document.getElementById('resultsStats');
    
    if (!searchTerm) {
        newsSectionElem.style.display = "block";
        resultsContainerElem.style.display = "none";
        resultsStatsElem.style.display = "none";
        renderNews();
        return;
    }
    
    let filteredContent = [...contentDatabase];
    if (currentCategory !== "all") {
        filteredContent = filteredContent.filter(item => item.type === currentCategory);
    }
    filteredContent = filteredContent.filter(item => 
        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
    );
    
    let filteredNews = [...newsDatabase];
    filteredNews = filteredNews.filter(news => 
        (news.title && news.title.toLowerCase().includes(searchTerm)) ||
        (news.description && news.description.toLowerCase().includes(searchTerm))
    );
    
    const allResults = [...filteredContent, ...filteredNews];
    const totalResults = allResults.length;
    
    newsSectionElem.style.display = "none";
    resultsContainerElem.style.display = "flex";
    resultsStatsElem.style.display = "block";
    document.getElementById('resultCount').innerText = totalResults;
    
    if (totalResults === 0) {
        resultsContainerElem.innerHTML = `<div class="empty-state">Ничего не найдено по запросу "${escapeHtml(searchTerm)}"</div>`;
        return;
    }
    
    const contentResults = allResults.filter(r => r.type);
    const newsResults = allResults.filter(r => r.category && !r.type);
    
    let html = '';
    
    if (contentResults.length > 0) {
        html += `<h3 style="margin: 0 0 1rem 0;">Контент (${contentResults.length})</h3>`;
        html += contentResults.map(item => {
            const typeLabel = getTypeLabel(item.type);
            const links = getLinksByType(item);
            let imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
            const isFav = isFavorite(item.id, 'content');
            
            return `
                <div class="result-card" data-id="${item.id}" data-type="${item.type}">
                    <div class="card-image" style="background-image: url(${imageUrl});"></div>
                    <div class="card-content">
                        <div class="card-header">
                            <span class="content-type">${typeLabel}</span>
                            ${currentUser ? `<button class="favorite-star-btn ${isFav ? 'active' : ''}" data-id="${item.id}" data-type="content" onclick="event.stopPropagation(); toggleFavorite(${item.id}, 'content')">${isFav ? '★' : '☆'}</button>` : ''}
                        </div>
                        <div class="title">${escapeHtml(item.title)}</div>
                        <div class="description">${escapeHtml((item.description || '').substring(0, 100))}...</div>
                        <div class="links-section">${links.map(link => `<a href="${link.url}" target="_blank" class="link-btn">${link.text}</a>`).join('')}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    if (newsResults.length > 0) {
        html += `<h3 style="margin: 1.5rem 0 1rem 0;">Новости (${newsResults.length})</h3>`;
        html += newsResults.map(news => {
            const isFav = isFavorite(news.id, 'news');
            return `
                <div class="news-card" style="margin-bottom: 1rem;">
                    <div class="news-header">
                        <span class="news-category">${escapeHtml(news.category)}</span>
                        <span class="news-date">${escapeHtml(news.date)}</span>
                        ${currentUser ? `<button class="favorite-star-btn ${isFav ? 'active' : ''}" data-id="${news.id}" data-type="news" onclick="event.stopPropagation(); toggleFavorite(${news.id}, 'news')">${isFav ? '★' : '☆'}</button>` : ''}
                    </div>
                    <div class="news-title" onclick="addCurrentToRecent(${news.id}, 'news'); window.open('${news.url}', '_blank')">${escapeHtml(news.title)}</div>
                    <div class="news-desc">${escapeHtml(news.description)}</div>
                    <div class="news-link" onclick="addCurrentToRecent(${news.id}, 'news'); window.open('${news.url}', '_blank')">Читать подробнее →</div>
                </div>
            `;
        }).join('');
    }
    
    resultsContainerElem.innerHTML = html;
    
    document.querySelectorAll('.favorite-star-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.id, btn.dataset.type);
        };
    });
    
    document.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
            addCurrentToRecent(parseInt(card.dataset.id), card.dataset.type);
        });
    });
}

// ========== СТРАНИЦА ИЗБРАННОГО ==========
function renderFavoritesPage() {
    document.getElementById('newsSection').style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    if (!currentUser) {
        resultsContainer.innerHTML = `<div class="empty-state">Войдите в аккаунт</div>`;
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    
    const favNews = newsDatabase.filter(n => favoriteNews.includes(n.id));
    const favContent = contentDatabase.filter(item => favorites.includes(item.id));
    const total = favNews.length + favContent.length;
    document.getElementById('resultCount').innerText = total;
    
    if (total === 0) {
        resultsContainer.innerHTML = `<div class="empty-state">Нет избранного</div>`;
        return;
    }
    
    let html = '';
    
    if (favContent.length > 0) {
        html += `<h3 style="margin:0 0 1rem 0;">Контент (${favContent.length})</h3>`;
        html += favContent.map(item => {
            const links = getLinksByType(item);
            let imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
            return `
                <div class="result-card">
                    <div class="card-image" style="background-image: url(${imageUrl});"></div>
                    <div class="card-content">
                        <div class="card-header">
                            <span class="content-type">${getTypeLabel(item.type)}</span>
                            <button class="favorite-star-btn active" data-id="${item.id}" data-type="content" onclick="toggleFavorite(${item.id}, 'content')">★</button>
                        </div>
                        <div class="title">${escapeHtml(item.title)}</div>
                        <div class="links-section">${links.map(link => `<a href="${link.url}" target="_blank" class="link-btn">${link.text}</a>`).join('')}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    if (favNews.length > 0) {
        html += `<h3 style="margin:1.5rem 0 1rem 0;">Новости (${favNews.length})</h3>`;
        html += favNews.map(news => `
            <div class="news-card" style="margin-bottom:1rem;">
                <div class="news-header">
                    <span class="news-category">${escapeHtml(news.category)}</span>
                    <span class="news-date">${escapeHtml(news.date)}</span>
                    <button class="favorite-star-btn active" data-id="${news.id}" data-type="news" onclick="toggleFavorite(${news.id}, 'news')">★</button>
                </div>
                <div class="news-title" onclick="window.open('${news.url}', '_blank')">${escapeHtml(news.title)}</div>
                <div class="news-desc">${escapeHtml(news.description)}</div>
                <div class="news-link" onclick="window.open('${news.url}', '_blank')">Читать подробнее →</div>
            </div>
        `).join('');
    }
    
    resultsContainer.innerHTML = html;
}

// ========== СТРАНИЦА НЕДАВНИХ ==========
function renderRecentPage() {
    document.getElementById('newsSection').style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    if (!currentUser) {
        resultsContainer.innerHTML = `<div class="empty-state">Войдите в аккаунт</div>`;
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    
    const recentItems = getRecentItems();
    document.getElementById('resultCount').innerText = recentItems.length;
    
    if (recentItems.length === 0) {
        resultsContainer.innerHTML = `<div class="empty-state">История пуста</div>`;
        return;
    }
    
    const contentItems = recentItems.filter(item => item.type !== 'news');
    const newsItems = recentItems.filter(item => item.type === 'news');
    
    let html = `<div style="display:flex; justify-content:flex-end; margin-bottom:1rem;"><button id="clearHistoryBtn" style="background:none; border:1px solid #ebebeb; padding:0.3rem 0.8rem; border-radius:6px; cursor:pointer; font-size:0.7rem; color:#c0392b;">Очистить историю</button></div>`;
    
    if (contentItems.length > 0) {
        html += `<h3 style="margin:0 0 1rem 0;">Контент (${contentItems.length})</h3>`;
        for (const item of contentItems) {
            const imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
            const fullItem = contentDatabase.find(dbItem => dbItem.id == item.id);
            const links = fullItem ? getLinksByType(fullItem) : [];
            html += `
                <div class="result-card">
                    <div class="card-image" style="background-image: url(${imageUrl});"></div>
                    <div class="card-content">
                        <div class="card-header">
                            <span class="content-type">${getTypeLabel(item.type)}</span>
                            <div><button class="remove-recent-btn" data-id="${item.id}" style="background:none; border:none; cursor:pointer; color:#ccc;"><i class="fas fa-times-circle"></i></button></div>
                        </div>
                        <div class="title">${escapeHtml(item.title)}</div>
                        <div class="links-section">${links.map(link => `<a href="${link.url}" target="_blank" class="link-btn">${link.text}</a>`).join('')}</div>
                    </div>
                </div>
            `;
        }
    }
    
    if (newsItems.length > 0) {
        html += `<h3 style="margin:1.5rem 0 1rem 0;">Новости (${newsItems.length})</h3>`;
        for (const item of newsItems) {
            html += `
                <div class="news-card" style="margin-bottom:1rem;">
                    <div class="news-header">
                        <span class="news-category">${escapeHtml(item.category)}</span>
                        <span class="news-date">${escapeHtml(item.date)}</span>
                        <div><button class="remove-recent-news-btn" data-id="${item.id}" style="background:none; border:none; cursor:pointer; color:#ccc;"><i class="fas fa-times-circle"></i></button></div>
                    </div>
                    <div class="news-title" onclick="window.open('${item.url}', '_blank')">${escapeHtml(item.title)}</div>
                    <div class="news-desc">${escapeHtml(item.description)}</div>
                    <div class="news-link" onclick="window.open('${item.url}', '_blank')">Читать подробнее →</div>
                </div>
            `;
        }
    }
    
    resultsContainer.innerHTML = html;
    
    document.querySelectorAll('.remove-recent-btn, .remove-recent-news-btn').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            let recentItems = getRecentItems();
            recentItems = recentItems.filter(item => item.id !== id);
            localStorage.setItem(`recent_${currentUser.email}`, JSON.stringify(recentItems));
            renderRecentPage();
            showToast("Удалено из истории");
        };
    });
    
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm("Очистить всю историю?")) {
                localStorage.setItem(`recent_${currentUser.email}`, '[]');
                renderRecentPage();
                showToast("История очищена");
            }
        };
    }
}

// ========== СТРАНИЦА КОЛЛЕКЦИЙ ==========
function renderCollectionsPage() {
    document.getElementById('newsSection').style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    const collections = [
        { name: "Игры от CD Projekt RED", items: ["Ведьмак 3", "Cyberpunk 2077"] },
        { name: "Фильмы Кристофера Нолана", items: ["Интерстеллар", "Оппенгеймер"] },
        { name: "Книги по вселенной Ведьмака", items: ["Последнее желание", "Меч Предназначения"] }
    ];
    
    document.getElementById('resultCount').innerText = collections.length;
    
    resultsContainer.innerHTML = `
        <div>
            <h3 style="margin-bottom:1rem;">Наши коллекции</h3>
            ${collections.map(c => `
                <div style="background:#fafafa; border-radius:12px; padding:1rem; margin-bottom:1rem; border:1px solid #ebebeb;">
                    <h4>${c.name}</h4>
                    <div style="margin-top:0.5rem;">${c.items.map(item => `<span style="display:inline-block; background:#e8e8e8; padding:0.2rem 0.6rem; border-radius:4px; margin-right:0.5rem; font-size:0.7rem; cursor:pointer;" onclick="document.getElementById('searchInput').value='${item}'; document.getElementById('searchBtn').click()">${item}</span>`).join('')}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== АВТОРИЗАЦИЯ ==========
function openModal() { if (modal) modal.style.display = "flex"; }
function closeModal() { if (modal) modal.style.display = "none"; }

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if (tab === 'login') {
        document.querySelector('.tab-btn[data-tab="login"]').classList.add('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        document.querySelector('.tab-btn[data-tab="register"]').classList.add('active');
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (email && password) {
        currentUser = { name: email.split('@')[0], email: email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        if (email === 'admin@seeker.com' && password === 'admin123') {
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            alert("Добро пожаловать, Администратор!");
        } else {
            isAdmin = false;
            localStorage.setItem('isAdmin', 'false');
            alert("Добро пожаловать, " + currentUser.name + "!");
        }
        updateUserUI();
        closeModal();
        renderNews();
        if (currentPage === "favorites") renderFavoritesPage();
        if (currentPage === "recent") renderRecentPage();
    }
}

function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;
    if (!name || !email || !password) { alert("Заполните все поля"); return; }
    if (password !== password2) { alert("Пароли не совпадают"); return; }
    currentUser = { name: name, email: email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    isAdmin = false;
    localStorage.setItem('isAdmin', 'false');
    updateUserUI();
    closeModal();
    alert("Добро пожаловать, " + name + "!");
}

function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.setItem('isAdmin', 'false');
    updateUserUI();
    renderNews();
    if (currentPage === "favorites") renderFavoritesPage();
    if (currentPage === "recent") renderRecentPage();
}

function updateUserUI() {
    const userMenu = document.getElementById('userMenu');
    const showAuthBtn = document.getElementById('showAuthBtn');
    const userNameSpan = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const adminPanel = document.getElementById('adminPanel');
    
    if (currentUser) {
        userMenu.style.display = "flex";
        showAuthBtn.style.display = "none";
        userNameSpan.innerText = currentUser.name;
        userAvatar.innerText = currentUser.name.charAt(0).toUpperCase();
    } else {
        userMenu.style.display = "none";
        showAuthBtn.style.display = "block";
    }
    if (adminPanel) adminPanel.style.display = isAdmin ? "block" : "none";
}

// ========== НАВИГАЦИЯ ==========
function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
        if (li.dataset.page === page) li.classList.add('active');
    });
    
    if (page === "home") {
        document.getElementById('newsSection').style.display = "block";
        resultsContainer.style.display = "none";
        resultsStatsBlock.style.display = "none";
        renderNews();
    } else if (page === "favorites") {
        renderFavoritesPage();
    } else if (page === "recent") {
        renderRecentPage();
    } else if (page === "collections") {
        renderCollectionsPage();
    }
}

// ========== АВТООБНОВЛЕНИЕ НОВОСТЕЙ ==========
function updateAllNews() {
    const refreshBtn = document.getElementById('refreshNewsBtn');
    if (refreshBtn) {
        refreshBtn.innerHTML = 'Загрузка...';
        refreshBtn.disabled = true;
    }
    
    // Добавляем несколько новых демо-новостей для теста
    const demoNews = [
        { category: "Игры", title: "Новый трейлер GTA 6 набрал 100 млн просмотров за сутки", description: "Рекордный трейлер долгожданной игры побил все ожидания.", url: "https://www.rockstargames.com/gta-vi" },
        { category: "Фильмы", title: "Дэдпул 3: первые отзывы критиков", description: "Критики в восторге от триквела с Райаном Рейнольдсом и Хью Джекманом.", url: "https://www.marvel.com/movies/deadpool-3" },
        { category: "Сериалы", title: "Fallout продлён на 2 сезон", description: "Amazon Prime Video подтвердил продолжение хита по мотивам игры.", url: "https://www.amazon.com/Fallout" }
    ];
    
    let added = 0;
    for (const news of demoNews) {
        if (!newsDatabase.some(n => n.title === news.title)) {
            newsDatabase.unshift({
                id: Date.now() + added,
                category: news.category,
                title: news.title,
                description: news.description,
                date: new Date().toLocaleString(),
                url: news.url
            });
            added++;
        }
    }
    
    if (added > 0) {
        if (newsDatabase.length > 30) newsDatabase = newsDatabase.slice(0, 30);
        saveNewsToStorage();
        renderNews();
        showToast(`Добавлено ${added} новых новостей!`);
    } else {
        showToast("Новости актуальны!");
    }
    
    if (refreshBtn) {
        refreshBtn.innerHTML = 'Свежие';
        refreshBtn.disabled = false;
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализация...');
    
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    resultsContainer = document.getElementById('resultsContainer');
    resultsStatsBlock = document.getElementById('resultsStats');
    newsSection = document.getElementById('newsSection');
    
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
    
    document.querySelectorAll('.type-filters li').forEach(filter => {
        filter.addEventListener('click', () => {
            document.querySelectorAll('.type-filters li').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentCategory = filter.dataset.category;
            if (currentPage === "home" && currentQuery) performSearch();
        });
    });
    
    document.querySelectorAll('.sidebar-menu li').forEach(menuItem => {
        menuItem.addEventListener('click', () => navigateTo(menuItem.dataset.page));
    });
    
    const showAuthBtn = document.getElementById('showAuthBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    if (showAuthBtn) showAuthBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (registerBtn) registerBtn.addEventListener('click', handleRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    window.onclick = (e) => { if (e.target === modal) closeModal(); };
    
    const adminAddBtn = document.getElementById('adminAddNewsBtn');
    const adminUpdateBtn = document.getElementById('adminUpdateNewsBtn');
    const refreshBtn = document.getElementById('refreshNewsBtn');
    
    if (adminAddBtn) adminAddBtn.onclick = showAddNewsModal;
    if (adminUpdateBtn) adminUpdateBtn.onclick = updateAllNews;
    if (refreshBtn) refreshBtn.onclick = updateAllNews;
    
    updateUserUI();
    renderNews();
    
    console.log('Инициализация завершена, в базе данных:', contentDatabase.length, 'записей');
});

// Делаем функции глобальными для доступа из HTML
window.toggleFavorite = toggleFavorite;
window.addCurrentToRecent = addCurrentToRecent;
window.openModal = openModal;
window.editNewsModal = editNewsModal;
window.showAddNewsModal = showAddNewsModal;