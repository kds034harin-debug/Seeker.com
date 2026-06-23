// ========== ИНИЦИАЛИЗАЦИЯ ==========
let searchInput, searchBtn, resultsContainer, resultsStatsBlock, newsSection;
let currentCategory = "all";
let currentPage = "home";
let currentQuery = "";
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let favoriteNews = JSON.parse(localStorage.getItem('favoriteNews') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let isLoading = false;

const authModal = document.getElementById('authModal');
const newsModal = document.getElementById('newsModal');

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
    const timeSpan = document.getElementById('newsUpdateTime');
    if (timeSpan) timeSpan.innerText = `Обновлено: ${new Date().toLocaleString()}`;
}

function saveFavoritesToStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('favoriteNews', JSON.stringify(favoriteNews));
}

// ========== ВАЛИДАЦИЯ ПАРОЛЯ ==========
function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Пароль должен содержать минимум 6 символов' };
    }
    return { valid: true };
}

// ========== ФУНКЦИИ ИЗБРАННОГО ==========
function toggleFavorite(itemId, type) {
    if (!currentUser) {
        showToast("Войдите в аккаунт!");
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
        if (currentPage === "favorites") renderFavoritesPage();
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

function clearRecentHistory() {
    if (!currentUser) return;
    if (confirm("Очистить всю историю просмотров?")) {
        localStorage.setItem(`recent_${currentUser.email}`, '[]');
        if (currentPage === "recent") renderRecentPage();
        showToast("История просмотров очищена!");
    }
}

function removeFromRecent(itemId) {
    if (!currentUser) return;
    let recentItems = JSON.parse(localStorage.getItem(`recent_${currentUser.email}`) || '[]');
    recentItems = recentItems.filter(item => item.id !== itemId);
    localStorage.setItem(`recent_${currentUser.email}`, JSON.stringify(recentItems));
    if (currentPage === "recent") renderRecentPage();
    showToast("Элемент удалён из истории");
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

// ========== МОДАЛЬНОЕ ОКНО НОВОСТЕЙ ==========
function openNewsModal(newsId = null) {
    const modal = document.getElementById('newsModal');
    const title = document.getElementById('newsModalTitle');
    const category = document.getElementById('newsCategory');
    const newsTitle = document.getElementById('newsTitle');
    const description = document.getElementById('newsDescription');
    const url = document.getElementById('newsUrl');
    const editId = document.getElementById('newsEditId');
    const saveBtn = document.getElementById('newsSaveBtn');
    
    if (newsId) {
        // Режим редактирования
        const news = newsDatabase.find(n => n.id === newsId);
        if (!news) {
            showToast('Новость не найдена');
            return;
        }
        title.textContent = '✏️ Редактирование новости';
        category.value = news.category;
        newsTitle.value = news.title;
        description.value = news.description;
        url.value = news.url;
        editId.value = newsId;
        saveBtn.textContent = 'Обновить';
    } else {
        // Режим создания
        title.textContent = '📝 Создание новости';
        category.value = '';
        newsTitle.value = '';
        description.value = '';
        url.value = 'https://';
        editId.value = '';
        saveBtn.textContent = 'Сохранить';
    }
    
    modal.style.display = 'flex';
}

function closeNewsModal() {
    document.getElementById('newsModal').style.display = 'none';
}

function saveNewsFromModal() {
    const category = document.getElementById('newsCategory').value.trim();
    const title = document.getElementById('newsTitle').value.trim();
    const description = document.getElementById('newsDescription').value.trim();
    const url = document.getElementById('newsUrl').value.trim();
    const editId = document.getElementById('newsEditId').value;
    
    // Валидация
    if (!category) {
        showToast('Введите категорию!');
        return;
    }
    if (!title) {
        showToast('Введите заголовок!');
        return;
    }
    if (!description) {
        showToast('Введите описание!');
        return;
    }
    if (!url) {
        showToast('Введите ссылку!');
        return;
    }
    
    if (editId) {
        // Редактирование
        const news = newsDatabase.find(n => n.id === parseInt(editId));
        if (news) {
            news.category = category;
            news.title = title;
            news.description = description;
            news.url = url;
            news.date = new Date().toLocaleString();
            showToast('✅ Новость обновлена!');
        }
    } else {
        // Создание
        newsDatabase.unshift({
            id: Date.now(),
            category: category,
            title: title,
            description: description,
            date: new Date().toLocaleString(),
            url: url
        });
        showToast('✅ Новость добавлена!');
    }
    
    saveNewsToStorage();
    renderNews();
    closeNewsModal();
}

// ========== ОТРИСОВКА НОВОСТЕЙ ==========
function renderNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    const isAdminUser = isAdmin || (currentUser && currentUser.email === 'admin@seeker.com');
    
    // Сортировка новостей по дате (сначала новые)
    const sortedNews = [...newsDatabase].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    newsContainer.innerHTML = sortedNews.map(news => {
        const isFav = isFavorite(news.id, 'news');
        return `
            <div class="news-card">
                <div class="news-header">
                    <span class="news-category">${escapeHtml(news.category)}</span>
                    <span class="news-date">${escapeHtml(news.date)}</span>
                    ${currentUser ? `<button class="favorite-star-btn ${isFav ? 'active' : ''}" data-id="${news.id}" data-type="news" onclick="event.stopPropagation(); toggleFavorite(${news.id}, 'news')">${isFav ? '★' : '☆'}</button>` : ''}
                    ${isAdminUser ? `
                        <button class="edit-news-btn" data-id="${news.id}" style="background:#f0f0f0; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:10px;" onclick="openNewsModal(${news.id})">✏️ Ред</button>
                        <button class="delete-news-btn" data-id="${news.id}" style="background:#f0f0f0; border:1px solid #ebebeb; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:10px; color:#c0392b;" onclick="if(confirm('Удалить новость?')){ newsDatabase = newsDatabase.filter(n=>n.id!==${news.id}); saveNewsToStorage(); renderNews(); showToast('🗑️ Новость удалена'); }">🗑️ Удал</button>
                    ` : ''}
                </div>
                <div class="news-title" onclick="addCurrentToRecent(${news.id}, 'news'); window.open('${news.url}', '_blank')">${escapeHtml(news.title)}</div>
                <div class="news-desc">${escapeHtml(news.description)}</div>
                <div class="news-link" onclick="addCurrentToRecent(${news.id}, 'news'); window.open('${news.url}', '_blank')">Читать подробнее →</div>
            </div>
        `;
    }).join('');
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

// ========== ПОИСК С ИНТЕГРАЦИЕЙ API ==========
async function performSearch() {
    if (isLoading) return;
    
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
    
    isLoading = true;
    resultsContainerElem.innerHTML = `<div class="loading-spinner" style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-pulse"></i> Поиск на Кинопоиске...</div>`;
    resultsContainerElem.style.display = "flex";
    resultsStatsElem.style.display = "block";
    newsSectionElem.style.display = "none";
    
    try {
        // Поиск через API Кинопоиска
        let apiResults = await searchKinopoiskAPI(searchTerm);
        
        // Поиск в локальной базе
        let localResults = contentDatabase.filter(item => 
            (item.title && item.title.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
        
        // Фильтр по типу
        if (currentCategory !== "all") {
            localResults = localResults.filter(item => item.type === currentCategory);
            apiResults = apiResults.filter(item => item.type === currentCategory);
        }
        
        // Объединяем результаты (сначала API, потом локальные)
        let allResults = [...apiResults];
        for (const local of localResults) {
            if (!allResults.some(api => api.title === local.title)) {
                allResults.push(local);
            }
        }
        
        // Поиск в новостях
        let filteredNews = newsDatabase.filter(news => 
            (news.title && news.title.toLowerCase().includes(searchTerm)) ||
            (news.description && news.description.toLowerCase().includes(searchTerm))
        );
        
        const totalResults = allResults.length + filteredNews.length;
        document.getElementById('resultCount').innerText = totalResults;
        
        if (totalResults === 0) {
            resultsContainerElem.innerHTML = `<div class="empty-state">Ничего не найдено по запросу "${escapeHtml(searchTerm)}"</div>`;
            isLoading = false;
            return;
        }
        
        let html = '';
        
        if (allResults.length > 0) {
            html += `<h3 style="margin: 0 0 1rem 0;">🎬 Контент (${allResults.length})</h3>`;
            html += allResults.map(item => {
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
                                ${item.rating ? `<span class="year-rating">⭐ ${item.rating}</span>` : ''}
                                ${currentUser ? `<button class="favorite-star-btn ${isFav ? 'active' : ''}" data-id="${item.id}" data-type="content" onclick="event.stopPropagation(); toggleFavorite(${item.id}, 'content')">${isFav ? '★' : '☆'}</button>` : ''}
                            </div>
                            <div class="title">${escapeHtml(item.title)}</div>
                            <div class="description">${escapeHtml((item.description || '').substring(0, 120))}...</div>
                            <div class="links-section">${links.map(link => `<a href="${link.url}" target="_blank" class="link-btn">${link.text}</a>`).join('')}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        if (filteredNews.length > 0) {
            html += `<h3 style="margin: 1.5rem 0 1rem 0;">📰 Новости (${filteredNews.length})</h3>`;
            html += filteredNews.map(news => {
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
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        resultsContainerElem.innerHTML = `<div class="empty-state">Ошибка поиска. Попробуйте позже.</div>`;
    } finally {
        isLoading = false;
    }
}

// ========== СТРАНИЦА ИЗБРАННОГО ==========
function renderFavoritesPage() {
    const newsSectionElem = document.getElementById('newsSection');
    newsSectionElem.style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    if (!currentUser) {
        resultsContainer.innerHTML = `<div class="empty-state">Войдите в аккаунт, чтобы видеть избранное</div>`;
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    
    const favNews = newsDatabase.filter(n => favoriteNews.includes(n.id));
    const favContent = contentDatabase.filter(item => favorites.includes(item.id));
    const total = favNews.length + favContent.length;
    document.getElementById('resultCount').innerText = total;
    
    if (total === 0) {
        resultsContainer.innerHTML = `<div class="empty-state">У вас пока нет избранного</div>`;
        return;
    }
    
    let html = '';
    
    if (favContent.length > 0) {
        html += `<h3 style="margin:0 0 1rem 0;">🎬 Контент (${favContent.length})</h3>`;
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
        html += `<h3 style="margin:1.5rem 0 1rem 0;">📰 Новости (${favNews.length})</h3>`;
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
    const newsSectionElem = document.getElementById('newsSection');
    newsSectionElem.style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    if (!currentUser) {
        resultsContainer.innerHTML = `<div class="empty-state">Войдите в аккаунт, чтобы видеть историю просмотров</div>`;
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    
    const recentItems = getRecentItems();
    const totalCount = recentItems.length;
    document.getElementById('resultCount').innerText = totalCount;
    
    if (totalCount === 0) {
        resultsContainer.innerHTML = `<div class="empty-state">История просмотров пуста</div>`;
        return;
    }
    
    const contentItems = recentItems.filter(item => item.type !== 'news');
    const newsItems = recentItems.filter(item => item.type === 'news');
    
    let html = `<div style="display:flex; justify-content:flex-end; margin-bottom:1rem;"><button id="clearHistoryBtn" style="background:none; border:1px solid #ebebeb; padding:0.3rem 0.8rem; border-radius:6px; cursor:pointer; font-size:0.7rem; color:#c0392b;">Очистить историю</button></div>`;
    
    if (contentItems.length > 0) {
        html += `<h3 style="margin:0 0 1rem 0;">🎬 Просмотренный контент (${contentItems.length})</h3>`;
        for (const item of contentItems) {
            const imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
            const fullItem = contentDatabase.find(dbItem => dbItem.id == item.id);
            const links = fullItem ? getLinksByType(fullItem) : [];
            html += `
                <div class="result-card recent-item">
                    <div class="card-image" style="background-image: url(${imageUrl});"></div>
                    <div class="card-content">
                        <div class="card-header">
                            <span class="content-type">${getTypeLabel(item.type)}</span>
                            <div><button class="remove-recent-btn" data-id="${item.id}" style="background:none; border:none; cursor:pointer; color:#ccc;"><i class="fas fa-times-circle"></i></button></div>
                        </div>
                        <div class="title">${escapeHtml(item.title)}</div>
                        <div class="description" style="font-size:0.7rem; color:#aaa;">Просмотрено: ${item.date}</div>
                        <div class="links-section">${links.map(link => `<a href="${link.url}" target="_blank" class="link-btn">${link.text}</a>`).join('')}</div>
                    </div>
                </div>
            `;
        }
    }
    
    if (newsItems.length > 0) {
        html += `<h3 style="margin:1.5rem 0 1rem 0;">📰 Просмотренные новости (${newsItems.length})</h3>`;
        for (const item of newsItems) {
            html += `
                <div class="news-card recent-news-item" style="margin-bottom:1rem;">
                    <div class="news-header">
                        <span class="news-category">${escapeHtml(item.category || 'Новости')}</span>
                        <span class="news-date">${escapeHtml(item.date)}</span>
                        <div><button class="remove-recent-news-btn" data-id="${item.id}" style="background:none; border:none; cursor:pointer; color:#ccc;"><i class="fas fa-times-circle"></i></button></div>
                    </div>
                    <div class="news-title" onclick="window.open('${item.url}', '_blank')">${escapeHtml(item.title)}</div>
                    <div class="news-desc">${escapeHtml(item.description || '')}</div>
                    <div class="news-link" onclick="window.open('${item.url}', '_blank')">Читать подробнее →</div>
                </div>
            `;
        }
    }
    
    resultsContainer.innerHTML = html;
    
    document.querySelectorAll('.remove-recent-btn, .remove-recent-news-btn').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            removeFromRecent(id);
        };
    });
    
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) clearBtn.onclick = () => clearRecentHistory();
}

// ========== СТРАНИЦА КОЛЛЕКЦИЙ ==========
function renderCollectionsPage() {
    const newsSectionElem = document.getElementById('newsSection');
    newsSectionElem.style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    const collections = [
        { name: "Игры от CD Projekt RED", items: ["Ведьмак 3", "Cyberpunk 2077"] },
        { name: "Фильмы Кристофера Нолана", items: ["Интерстеллар", "Оппенгеймер"] },
        { name: "Книги по вселенной Ведьмака", items: ["Последнее желание", "Меч Предназначения"] },
        { name: "Лучшие игры 2023-2024", items: ["Baldur's Gate 3", "Alan Wake 2", "The Last of Us Part I"] }
    ];
    
    document.getElementById('resultCount').innerText = collections.length;
    
    resultsContainer.innerHTML = `
        <div class="collections-page">
            <h3 style="margin-bottom: 1.5rem;">📁 Наши коллекции</h3>
            ${collections.map(c => `
                <div class="collection-card" style="background: #fafafa; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; border: 1px solid #ebebeb;">
                    <h4 style="margin-bottom: 0.5rem;">${c.name}</h4>
                    <div class="collection-items" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                        ${c.items.map(item => `<span class="collection-tag" style="display: inline-block; background: #e8e8e8; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; cursor: pointer;" onclick="document.getElementById('searchInput').value='${item}'; document.getElementById('searchBtn').click()">${item}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== АВТОРИЗАЦИЯ ==========
function openModal() { if (authModal) authModal.style.display = "flex"; }
function closeModal() { if (authModal) authModal.style.display = "none"; }

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
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginPasswordError');
    
    if (errorEl) errorEl.textContent = '';
    
    if (!email || !password) {
        alert('Заполните все поля');
        return;
    }
    
    // Проверка пароля
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        if (errorEl) {
            errorEl.textContent = passwordCheck.message;
        } else {
            alert(passwordCheck.message);
        }
        return;
    }
    
    currentUser = { name: email.split('@')[0], email: email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Восстанавливаем избранное пользователя
    const savedFav = localStorage.getItem(`favorites_${email}`);
    const savedFavNews = localStorage.getItem(`favoriteNews_${email}`);
    if (savedFav) favorites = JSON.parse(savedFav);
    if (savedFavNews) favoriteNews = JSON.parse(savedFavNews);
    
    if (email === 'admin@seeker.com' && password === 'admin123') {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        showToast('👋 Добро пожаловать, Администратор!');
    } else {
        isAdmin = false;
        localStorage.setItem('isAdmin', 'false');
        showToast('👋 Добро пожаловать, ' + currentUser.name + '!');
    }
    
    updateUserUI();
    closeModal();
    renderNews();
    if (currentPage === "favorites") renderFavoritesPage();
    if (currentPage === "recent") renderRecentPage();
}

function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;
    const errorEl = document.getElementById('regPasswordError');
    
    if (errorEl) errorEl.textContent = '';
    
    if (!name || !email || !password) {
        alert('Заполните все поля');
        return;
    }
    
    // Проверка пароля
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        if (errorEl) {
            errorEl.textContent = passwordCheck.message;
        } else {
            alert(passwordCheck.message);
        }
        return;
    }
    
    if (password !== password2) {
        if (errorEl) {
            errorEl.textContent = 'Пароли не совпадают';
        } else {
            alert('Пароли не совпадают');
        }
        return;
    }
    
    currentUser = { name: name, email: email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    isAdmin = false;
    localStorage.setItem('isAdmin', 'false');
    updateUserUI();
    closeModal();
    showToast('👋 Добро пожаловать, ' + name + '!');
}

function logout() {
    if (currentUser) {
        localStorage.setItem(`favorites_${currentUser.email}`, JSON.stringify(favorites));
        localStorage.setItem(`favoriteNews_${currentUser.email}`, JSON.stringify(favoriteNews));
    }
    currentUser = null;
    isAdmin = false;
    favorites = [];
    favoriteNews = [];
    localStorage.removeItem('currentUser');
    localStorage.setItem('isAdmin', 'false');
    updateUserUI();
    renderNews();
    if (currentPage === "favorites") renderFavoritesPage();
    if (currentPage === "recent") renderRecentPage();
    showToast('👋 Вы вышли из аккаунта');
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
        showToast(`✅ Добавлено ${added} новых новостей!`);
    } else {
        showToast("Новости актуальны!");
    }
    
    if (refreshBtn) {
        refreshBtn.innerHTML = '🔄 Свежие';
        refreshBtn.disabled = false;
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализация...');
    console.log('API Кинопоиска ключ загружен');
    
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
    
    // Обработчики для модального окна авторизации
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
    
    // Обработчики для модального окна новостей
    const closeNewsModalBtn = document.getElementById('closeNewsModalBtn');
    const newsCancelBtn = document.getElementById('newsCancelBtn');
    const newsSaveBtn = document.getElementById('newsSaveBtn');
    const adminAddBtn = document.getElementById('adminAddNewsBtn');
    const adminUpdateBtn = document.getElementById('adminUpdateNewsBtn');
    const refreshBtn = document.getElementById('refreshNewsBtn');
    
    if (closeNewsModalBtn) closeNewsModalBtn.addEventListener('click', closeNewsModal);
    if (newsCancelBtn) newsCancelBtn.addEventListener('click', closeNewsModal);
    if (newsSaveBtn) newsSaveBtn.addEventListener('click', saveNewsFromModal);
    if (adminAddBtn) adminAddBtn.addEventListener('click', () => openNewsModal());
    if (adminUpdateBtn) adminUpdateBtn.addEventListener('click', updateAllNews);
    if (refreshBtn) refreshBtn.addEventListener('click', updateAllNews);
    
    // Обработка Enter в модальном окне новостей
    const newsCategory = document.getElementById('newsCategory');
    const newsTitle = document.getElementById('newsTitle');
    const newsDescription = document.getElementById('newsDescription');
    const newsUrl = document.getElementById('newsUrl');
    
    if (newsCategory) {
        newsCategory.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (newsTitle) newsTitle.focus();
            }
        });
    }
    
    if (newsTitle) {
        newsTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (newsDescription) newsDescription.focus();
            }
        });
    }
    
    if (newsDescription) {
        newsDescription.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newsUrl) newsUrl.focus();
            }
        });
    }
    
    if (newsUrl) {
        newsUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveNewsFromModal();
            }
        });
    }
    
    // Закрытие модалок по клику вне окна
    window.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
        if (e.target === newsModal) closeNewsModal();
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeNewsModal();
        }
    });
    
    updateUserUI();
    renderNews();
    saveNewsToStorage();
    
    console.log('Инициализация завершена');
});

// Делаем функции глобальными для доступа из HTML
window.toggleFavorite = toggleFavorite;
window.addCurrentToRecent = addCurrentToRecent;
window.openModal = openModal;
window.closeModal = closeModal;
window.openNewsModal = openNewsModal;
window.closeNewsModal = closeNewsModal;
window.saveNewsFromModal = saveNewsFromModal;
window.performSearch = performSearch;
window.navigateTo = navigateTo;
window.updateAllNews = updateAllNews;
