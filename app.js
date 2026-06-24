// ========== ИНИЦИАЛИЗАЦИЯ ==========
let searchInput = null;
let searchBtn = null;
let resultsContainer = null;
let resultsStatsBlock = null;
let newsSection = null;
let currentCategory = "all";
let currentPage = "home";
let currentQuery = "";
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let favoriteNews = JSON.parse(localStorage.getItem('favoriteNews') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let isLoading = false;

let authModal = null;
let newsModal = null;

// ========== НОВОСТИ ==========
let newsDatabase = JSON.parse(localStorage.getItem('seeker_news')) || [
    { 
        id: 1, category: "🎬 Фильмы", 
        title: "Дюна 2 собрала 700 миллионов долларов в прокате", 
        description: "Продолжение эпической саги Дени Вильнёва продолжает бить рекорды.", 
        date: new Date().toLocaleString(), 
        url: "https://www.kinopoisk.ru/film/dyuna-chast-vtoraya-2024/" 
    },
    { 
        id: 2, category: "📺 Сериалы", 
        title: "Новый сериал по Гарри Поттеру: первые детали", 
        description: "HBO раскрыл планы на 7 сезонов с новым актерским составом.", 
        date: new Date(Date.now() - 1000*60*60*5).toLocaleString(), 
        url: "https://www.hbo.com/harry-potter" 
    },
    { 
        id: 3, category: "🎬 Фильмы", 
        title: "Дэдпул 3: первые отзывы критиков", 
        description: "Критики в восторге от триквела с Райаном Рейнольдсом.", 
        date: new Date(Date.now() - 1000*60*60*8).toLocaleString(), 
        url: "https://www.marvel.com/movies/deadpool-3" 
    },
    { 
        id: 4, category: "📺 Сериалы", 
        title: "The Last of Us 2 сезон: дата выхода и подробности", 
        description: "HBO Max раскрыл первые кадры второго сезона.", 
        date: new Date(Date.now() - 1000*60*60*12).toLocaleString(), 
        url: "https://www.hbo.com/the-last-of-us" 
    },
    { 
        id: 5, category: "🎬 Фильмы", 
        title: "Дьявол носит Prada 2 официально анонсирован", 
        description: "Мерил Стрип и Энн Хэтэуэй могут вернуться к своим ролям.", 
        date: new Date(Date.now() - 1000*60*60*24).toLocaleString(), 
        url: "https://www.kinopoisk.ru/film/devil-wears-prada-2/" 
    },
    { 
        id: 6, category: "🎮 Игры", 
        title: "Новый трейлер GTA 6 набрал 100 млн просмотров за сутки", 
        description: "Рекордный трейлер долгожданной игры побил все ожидания.", 
        date: new Date(Date.now() - 1000*60*60*3).toLocaleString(), 
        url: "https://www.rockstargames.com/gta-vi" 
    },
    { 
        id: 7, category: "🎮 Игры", 
        title: "CD Projekt RED анонсировала новую игру во вселенной Ведьмака", 
        description: "Студия подтвердила разработку следующей части саги на Unreal Engine 5.", 
        date: new Date(Date.now() - 1000*60*60*6).toLocaleString(), 
        url: "https://www.thewitcher.com/ru/" 
    },
    { 
        id: 8, category: "🎮 Игры", 
        title: "The International 2024: рекордный призовой фонд", 
        description: "Турнир по Dota 2 соберет лучшие команды мира в Копенгагене.", 
        date: new Date(Date.now() - 1000*60*60*10).toLocaleString(), 
        url: "https://www.dota2.com/esports/ti13/" 
    },
    { 
        id: 9, category: "🎮 Игры", 
        title: "Fallout продлён на 2 сезон", 
        description: "Amazon Prime Video подтвердил продолжение хита по мотивам игры.", 
        date: new Date(Date.now() - 1000*60*60*18).toLocaleString(), 
        url: "https://www.amazon.com/Fallout" 
    },
    { 
        id: 10, category: "🎮 Игры", 
        title: "Valorant: вышел патч 8.11 с новым агентом", 
        description: "Riot Games представила сбалансированные изменения и свежего стража.", 
        date: new Date(Date.now() - 1000*60*60*30).toLocaleString(), 
        url: "https://playvalorant.com/ru-ru/news/" 
    },
    { 
        id: 11, category: "📚 Книги", 
        title: "Новая книга о Гарри Поттере выйдет в 2025", 
        description: "Джоан Роулинг работает над расширением магической вселенной.", 
        date: new Date(Date.now() - 1000*60*60*20).toLocaleString(), 
        url: "https://www.bloomsbury.com/uk/discover/harry-potter/" 
    },
    { 
        id: 12, category: "📚 Книги", 
        title: "Новая книга Стивена Кинга стала бестселлером", 
        description: "Роман 'Институт' возглавил списки продаж в России и США.", 
        date: new Date(Date.now() - 1000*60*60*28).toLocaleString(), 
        url: "https://www.litres.ru/author/stiven-king/" 
    },
    { 
        id: 13, category: "📚 Книги", 
        title: "Лауреаты премии Букер 2024 объявлены", 
        description: "Престижную литературную премию получила книга 'Западный край'.", 
        date: new Date(Date.now() - 1000*60*60*36).toLocaleString(), 
        url: "https://thebookerprizes.com/" 
    },
    { 
        id: 14, category: "💻 Технологии", 
        title: "Apple представила Vision Pro: новый стандарт AR/VR", 
        description: "Компания Apple представила свои первые очки дополненной реальности.", 
        date: new Date(Date.now() - 1000*60*60*40).toLocaleString(), 
        url: "https://www.apple.com/apple-vision-pro/" 
    },
    { 
        id: 15, category: "💻 Технологии", 
        title: "NVIDIA представила новое поколение видеокарт RTX 50", 
        description: "Новые видеокарты GeForce RTX 50 серии обещают значительный скачок производительности.", 
        date: new Date(Date.now() - 1000*60*60*48).toLocaleString(), 
        url: "https://www.nvidia.com/ru-ru/geforce/graphics-cards/" 
    },
    { 
        id: 16, category: "🎭 Культура", 
        title: "В Москве прошла выставка современного искусства", 
        description: "На выставке были представлены работы более 50 художников из 20 стран.", 
        date: new Date(Date.now() - 1000*60*60*56).toLocaleString(), 
        url: "https://www.culture.ru/" 
    },
    { 
        id: 17, category: "🎭 Культура", 
        title: "Новый альбом группы Radiohead стал платиновым", 
        description: "Долгожданный альбом британской рок-группы получил статус платинового.", 
        date: new Date(Date.now() - 1000*60*60*72).toLocaleString(), 
        url: "https://www.radiohead.com/" 
    },
    { 
        id: 18, category: "🎮 Игры", 
        title: "Call of Duty возвращается во Вьетнам", 
        description: "Activision анонсировала новую часть легендарной франшизы.", 
        date: new Date(Date.now() - 1000*60*60*80).toLocaleString(), 
        url: "https://www.callofduty.com/ru/" 
    },
    { 
        id: 19, category: "🎬 Фильмы", 
        title: "Новый фильм Кристофера Нолана выйдет в 2026 году", 
        description: "Режиссер 'Интерстеллара' и 'Оппенгеймера' готовит новый проект.", 
        date: new Date(Date.now() - 1000*60*60*96).toLocaleString(), 
        url: "https://www.kinopoisk.ru/name/111543/" 
    },
    { 
        id: 20, category: "📚 Книги", 
        title: "Роман 'Дюна' возвращается в список бестселлеров", 
        description: "После выхода фильма 'Дюна: Часть вторая' книга снова стала бестселлером.", 
        date: new Date(Date.now() - 1000*60*60*120).toLocaleString(), 
        url: "https://www.litres.ru/frenk-gerbert/duna/" 
    }
];

function saveNewsToStorage() {
    localStorage.setItem('seeker_news', JSON.stringify(newsDatabase));
    var timeSpan = document.getElementById('newsUpdateTime');
    if (timeSpan) timeSpan.innerText = 'Обновлено: ' + new Date().toLocaleString();
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
        var index = favoriteNews.indexOf(itemId);
        if (index !== -1) {
            favoriteNews.splice(index, 1);
            showToast("Новость удалена из избранного");
        } else {
            favoriteNews.push(itemId);
            showToast("Новость добавлена в избранное");
        }
        saveFavoritesToStorage();
        renderNews();
        if (currentPage === "favorites") renderFavoritesPage();
    } else {
        var idx = favorites.indexOf(itemId);
        if (idx !== -1) {
            favorites.splice(idx, 1);
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
    if (type === 'news') return favoriteNews.indexOf(itemId) !== -1;
    return favorites.indexOf(itemId) !== -1;
}

// ========== НЕДАВНИЕ ПРОСМОТРЫ ==========
var MAX_RECENT_ITEMS = 15;

function addToRecent(itemId, itemType, itemData) {
    if (!currentUser) return;
    var recentItems = JSON.parse(localStorage.getItem('recent_' + currentUser.email) || '[]');
    recentItems = recentItems.filter(function(item) { return item.id !== itemId; });
    recentItems.unshift({
        id: itemId,
        type: itemType,
        title: itemData.title,
        category: itemData.category || itemData.type,
        image: itemData.image || null,
        url: itemData.url || (itemData.links && (itemData.links.watch || itemData.links.buy)),
        date: new Date().toLocaleString()
    });
    if (recentItems.length > MAX_RECENT_ITEMS) recentItems = recentItems.slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem('recent_' + currentUser.email, JSON.stringify(recentItems));
}

function getRecentItems() {
    if (!currentUser) return [];
    return JSON.parse(localStorage.getItem('recent_' + currentUser.email) || '[]');
}

function clearRecentHistory() {
    if (!currentUser) return;
    if (confirm("Очистить всю историю просмотров?")) {
        localStorage.setItem('recent_' + currentUser.email, '[]');
        if (currentPage === "recent") renderRecentPage();
        showToast("История просмотров очищена!");
    }
}

function removeFromRecent(itemId) {
    if (!currentUser) return;
    var recentItems = JSON.parse(localStorage.getItem('recent_' + currentUser.email) || '[]');
    recentItems = recentItems.filter(function(item) { return item.id !== itemId; });
    localStorage.setItem('recent_' + currentUser.email, JSON.stringify(recentItems));
    if (currentPage === "recent") renderRecentPage();
    showToast("Элемент удалён из истории");
}

function addCurrentToRecent(itemId, itemType) {
    if (!currentUser) return;
    var itemData = null;
    if (itemType === 'news') {
        var news = newsDatabase.find(function(n) { return n.id == itemId; });
        if (news) itemData = { title: news.title, category: news.category, url: news.url };
    } else {
        var content = contentDatabase.find(function(c) { return c.id == itemId; });
        if (content) itemData = { title: content.title, type: content.type, image: content.image, url: content.links && (content.links.watch || content.links.buy) };
    }
    if (itemData) addToRecent(itemId, itemType, itemData);
}

// ========== МОДАЛЬНОЕ ОКНО НОВОСТЕЙ ==========
function openNewsModal(newsId) {
    newsId = newsId || null;
    var modal = document.getElementById('newsModal');
    var title = document.getElementById('newsModalTitle');
    var category = document.getElementById('newsCategory');
    var newsTitle = document.getElementById('newsTitle');
    var description = document.getElementById('newsDescription');
    var url = document.getElementById('newsUrl');
    var editId = document.getElementById('newsEditId');
    var saveBtn = document.getElementById('newsSaveBtn');
    
    if (newsId) {
        var news = newsDatabase.find(function(n) { return n.id === newsId; });
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
    var category = document.getElementById('newsCategory').value.trim();
    var title = document.getElementById('newsTitle').value.trim();
    var description = document.getElementById('newsDescription').value.trim();
    var url = document.getElementById('newsUrl').value.trim();
    var editId = document.getElementById('newsEditId').value;
    
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
        var news = newsDatabase.find(function(n) { return n.id === parseInt(editId, 10); });
        if (news) {
            news.category = category;
            news.title = title;
            news.description = description;
            news.url = url;
            news.date = new Date().toLocaleString();
            showToast('✅ Новость обновлена!');
        }
    } else {
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
    var newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    var isAdminUser = isAdmin || (currentUser && currentUser.email === 'admin@seeker.com');
    
    var sortedNews = newsDatabase.slice().sort(function(a, b) {
        var dateA = new Date(a.date);
        var dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    var html = '';
    for (var i = 0; i < sortedNews.length; i++) {
        var news = sortedNews[i];
        var isFav = isFavorite(news.id, 'news');
        var favButton = '';
        var adminButtons = '';
        
        if (currentUser) {
            favButton = '<button class="favorite-star-btn ' + (isFav ? 'active' : '') + '" data-id="' + news.id + '" data-type="news" onclick="event.stopPropagation(); toggleFavorite(' + news.id + ', \'news\')">' + (isFav ? '★' : '☆') + '</button>';
        }
        
        if (isAdminUser) {
            adminButtons = '<button class="edit-news-btn" data-id="' + news.id + '" style="background:#f0f0f0; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:10px;" onclick="openNewsModal(' + news.id + ')">✏️ Ред</button>' +
                '<button class="delete-news-btn" data-id="' + news.id + '" style="background:#f0f0f0; border:1px solid #ebebeb; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:10px; color:#c0392b;" onclick="if(confirm(\'Удалить новость?\')){ newsDatabase = newsDatabase.filter(function(n){return n.id!==' + news.id + '}); saveNewsToStorage(); renderNews(); showToast(\'🗑️ Новость удалена\'); }">🗑️ Удал</button>';
        }
        
        html += '<div class="news-card">' +
            '<div class="news-header">' +
            '<span class="news-category">' + escapeHtml(news.category) + '</span>' +
            '<span class="news-date">' + escapeHtml(news.date) + '</span>' +
            favButton +
            adminButtons +
            '</div>' +
            '<div class="news-title" onclick="addCurrentToRecent(' + news.id + ', \'news\'); window.open(\'' + news.url + '\', \'_blank\')">' + escapeHtml(news.title) + '</div>' +
            '<div class="news-desc">' + escapeHtml(news.description) + '</div>' +
            '<div class="news-link" onclick="addCurrentToRecent(' + news.id + ', \'news\'); window.open(\'' + news.url + '\', \'_blank\')">Читать подробнее →</div>' +
            '</div>';
    }
    
    newsContainer.innerHTML = html;
}

// ========== ОТРИСОВКА КАРТОЧЕК ==========
function renderCards(items) {
    if (!items || !items.length) {
        resultsContainer.innerHTML = '<div class="empty-state">Ничего не найдено</div>';
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    document.getElementById('resultCount').innerText = items.length;

    var html = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var typeLabel = getTypeLabel(item.type);
        var links = getLinksByType(item);
        var imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
        var isFav = isFavorite(item.id, 'content');
        var favButton = '';
        
        if (currentUser) {
            favButton = '<button class="favorite-star-btn ' + (isFav ? 'active' : '') + '" data-id="' + item.id + '" data-type="content" onclick="event.stopPropagation(); toggleFavorite(' + item.id + ', \'content\')">' + (isFav ? '★' : '☆') + '</button>';
        }
        
        var linksHtml = '';
        for (var j = 0; j < links.length; j++) {
            linksHtml += '<a href="' + links[j].url + '" target="_blank" class="link-btn">' + links[j].text + '</a>';
        }
        
        html += '<div class="result-card" data-id="' + item.id + '" data-type="' + item.type + '">' +
            '<div class="card-image" style="background-image: url(' + imageUrl + ');"></div>' +
            '<div class="card-content">' +
            '<div class="card-header">' +
            '<span class="content-type">' + typeLabel + '</span>' +
            '<span class="year-rating">' + (item.year || '') + ' ' + (item.rating ? '| ' + item.rating : '') + '</span>' +
            favButton +
            '</div>' +
            '<div class="title">' + escapeHtml(item.title) + '</div>' +
            '<div class="description">' + escapeHtml((item.description || '').substring(0, 150)) + ((item.description || '').length > 150 ? '...' : '') + '</div>' +
            '<div class="links-section">' + linksHtml + '</div>' +
            '</div>' +
            '</div>';
    }
    
    resultsContainer.innerHTML = html;
    
    var favoriteBtns = document.querySelectorAll('.favorite-star-btn');
    for (var k = 0; k < favoriteBtns.length; k++) {
        (function(btn) {
            btn.onclick = function(e) {
                e.stopPropagation();
                toggleFavorite(btn.dataset.id, btn.dataset.type);
            };
        })(favoriteBtns[k]);
    }
    
    var cards = document.querySelectorAll('.result-card');
    for (var l = 0; l < cards.length; l++) {
        (function(card) {
            card.addEventListener('click', function(e) {
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
                addCurrentToRecent(parseInt(card.dataset.id, 10), card.dataset.type);
            });
        })(cards[l]);
    }
}

// ========== ОТРИСОВКА ФИЛЬМОВ ==========
function renderMovies(movies) {
    if (!movies || !movies.length) {
        return '';
    }
    
    var html = '<h3 style="margin: 1.5rem 0 1rem 0;">🎬 Фильмы и сериалы (' + movies.length + ')</h3>';
    
    for (var i = 0; i < movies.length; i++) {
        var item = movies[i];
        var typeLabel = item.type === 'series' ? 'СЕРИАЛ' : 'ФИЛЬМ';
        var links = getLinksByType(item);
        var imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
        var isFav = isFavorite(item.id, 'content');
        var favButton = '';
        
        if (currentUser) {
            favButton = '<button class="favorite-star-btn ' + (isFav ? 'active' : '') + '" data-id="' + item.id + '" data-type="content" onclick="event.stopPropagation(); toggleFavorite(' + item.id + ', \'content\')">' + (isFav ? '★' : '☆') + '</button>';
        }
        
        var linksHtml = '';
        for (var j = 0; j < links.length; j++) {
            linksHtml += '<a href="' + links[j].url + '" target="_blank" class="link-btn">' + links[j].text + '</a>';
        }
        
        var ratingHtml = '';
        if (item.rating) {
            ratingHtml = '<span class="year-rating">⭐ ' + item.rating + '</span>';
        }
        
        html += '<div class="result-card" data-id="' + item.id + '" data-type="' + item.type + '">' +
            '<div class="card-image" style="background-image: url(' + imageUrl + ');"></div>' +
            '<div class="card-content">' +
            '<div class="card-header">' +
            '<span class="content-type" style="background:#1a1a1a; color:white; padding:2px 8px; border-radius:4px;">' + typeLabel + '</span>' +
            ratingHtml +
            favButton +
            '</div>' +
            '<div class="title">' + escapeHtml(item.title) + '</div>' +
            '<div class="description">' + escapeHtml((item.description || '').substring(0, 150)) + ((item.description || '').length > 150 ? '...' : '') + '</div>' +
            '<div class="links-section">' + linksHtml + '</div>' +
            '</div>' +
            '</div>';
    }
    
    return html;
}

// ========== ОТРИСОВКА ИГР ==========
function renderGames(games) {
    if (!games || !games.length) {
        return '';
    }
    
    var html = '<h3 style="margin: 1.5rem 0 1rem 0;">🎮 Игры (' + games.length + ')</h3>';
    
    for (var i = 0; i < games.length; i++) {
        var game = games[i];
        var imageUrl = game.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
        var isFav = isFavorite(game.id, 'content');
        var favButton = '';
        
        if (currentUser) {
            favButton = '<button class="favorite-star-btn ' + (isFav ? 'active' : '') + '" data-id="' + game.id + '" data-type="content" onclick="event.stopPropagation(); toggleFavorite(' + game.id + ', \'content\')">' + (isFav ? '★' : '☆') + '</button>';
        }
        
        var ratingHtml = '';
        if (game.rating) {
            ratingHtml = '<span class="year-rating">⭐ ' + game.rating + '</span>';
        }
        
        html += '<div class="result-card" data-id="' + game.id + '" data-type="game">' +
            '<div class="card-image" style="background-image: url(' + imageUrl + ');"></div>' +
            '<div class="card-content">' +
            '<div class="card-header">' +
            '<span class="content-type" style="background:#4CAF50; color:white; padding:2px 8px; border-radius:4px;">🎮 ИГРА</span>' +
            ratingHtml +
            favButton +
            '</div>' +
            '<div class="title">' + escapeHtml(game.title) + '</div>' +
            '<div class="description">' + escapeHtml((game.description || '').substring(0, 150)) + ((game.description || '').length > 150 ? '...' : '') + '</div>' +
            '<div class="info-grid">' +
            '<div class="info-item"><span class="info-label">Разработчик:</span> ' + escapeHtml(game.developer || 'Не указан') + '</div>' +
            '<div class="info-item"><span class="info-label">Платформы:</span> ' + escapeHtml(game.platforms || '—') + '</div>' +
            '</div>' +
            '<div class="links-section">' +
            '<a href="' + (game.links && game.links.buy || '#') + '" target="_blank" class="link-btn">🎮 Купить</a>' +
            '</div>' +
            '</div>' +
            '</div>';
    }
    
    return html;
}

// ========== ОТРИСОВКА КНИГ ==========
function renderBooks(books) {
    if (!books || !books.length) {
        return '';
    }
    
    var html = '<h3 style="margin: 1.5rem 0 1rem 0;">📚 Книги (' + books.length + ')</h3>';
    
    for (var i = 0; i < books.length; i++) {
        var book = books[i];
        var imageUrl = book.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
        var isFav = isFavorite(book.id, 'content');
        var favButton = '';
        
        if (currentUser) {
            favButton = '<button class="favorite-star-btn ' + (isFav ? 'active' : '') + '" data-id="' + book.id + '" data-type="content" onclick="event.stopPropagation(); toggleFavorite(' + book.id + ', \'content\')">' + (isFav ? '★' : '☆') + '</button>';
        }
        
        var ratingHtml = '';
        if (book.rating) {
            ratingHtml = '<span class="year-rating">⭐ ' + book.rating + ' / 5</span>';
        }
        
        html += '<div class="result-card book-card" data-id="' + book.id + '" data-type="book">' +
            '<div class="card-image" style="background-image: url(' + imageUrl + ');"></div>' +
            '<div class="card-content">' +
            '<div class="card-header">' +
            '<span class="content-type" style="background:#8B4513; color:white; padding:2px 8px; border-radius:4px;">📖 КНИГА</span>' +
            ratingHtml +
            favButton +
            '</div>' +
            '<div class="title">' + escapeHtml(book.title) + '</div>' +
            '<div class="description">' + escapeHtml((book.description || '').substring(0, 150)) + ((book.description || '').length > 150 ? '...' : '') + '</div>' +
            '<div class="info-grid">' +
            '<div class="info-item"><span class="info-label">Автор:</span> ' + escapeHtml(book.author || 'Не указан') + '</div>' +
            '<div class="info-item"><span class="info-label">Год:</span> ' + (book.year || 'Не указан') + '</div>' +
            '<div class="info-item"><span class="info-label">Страниц:</span> ' + (book.pages || '—') + '</div>' +
            '</div>' +
            '<div class="links-section">' +
            '<a href="' + (book.links && book.links.buy || '#') + '" target="_blank" class="link-btn">📖 Читать</a>' +
            '</div>' +
            '</div>' +
            '</div>';
    }
    
    return html;
}

// ========== ОТРИСОВКА НОВОСТЕЙ В РЕЗУЛЬТАТАХ ПОИСКА ==========
function renderNewsResults(newsList) {
    if (!newsList || !newsList.length) {
        return '';
    }
    
    var html = '<h3 style="margin: 1.5rem 0 1rem 0;">📰 Новости (' + newsList.length + ')</h3>';
    
    for (var i = 0; i < newsList.length; i++) {
        var news = newsList[i];
        var isFav = isFavorite(news.id, 'news');
        var favButton = '';
        
        if (currentUser) {
            favButton = '<button class="favorite-star-btn ' + (isFav ? 'active' : '') + '" data-id="' + news.id + '" data-type="news" onclick="event.stopPropagation(); toggleFavorite(' + news.id + ', \'news\')">' + (isFav ? '★' : '☆') + '</button>';
        }
        
        html += '<div class="news-card" style="margin-bottom: 1rem;">' +
            '<div class="news-header">' +
            '<span class="news-category">' + escapeHtml(news.category || 'Новости') + '</span>' +
            '<span class="news-date">' + escapeHtml(news.date) + '</span>' +
            favButton +
            '</div>' +
            '<div class="news-title" onclick="addCurrentToRecent(' + news.id + ', \'news\'); window.open(\'' + news.url + '\', \'_blank\')">' + escapeHtml(news.title) + '</div>' +
            '<div class="news-desc">' + escapeHtml(news.description) + '</div>' +
            '<div class="news-link" onclick="addCurrentToRecent(' + news.id + ', \'news\'); window.open(\'' + news.url + '\', \'_blank\')">Читать подробнее →</div>' +
            '</div>';
    }
    
    return html;
}

// ========== ПОИСК С ИНТЕГРАЦИЕЙ API ==========
async function performSearch() {
    if (isLoading) return;
    
    var searchTerm = searchInput.value.trim().toLowerCase();
    currentQuery = searchTerm;
    
    var newsSectionElem = document.getElementById('newsSection');
    var resultsContainerElem = document.getElementById('resultsContainer');
    var resultsStatsElem = document.getElementById('resultsStats');
    
    if (!searchTerm) {
        newsSectionElem.style.display = "block";
        resultsContainerElem.style.display = "none";
        resultsStatsElem.style.display = "none";
        renderNews();
        return;
    }
    
    isLoading = true;
    resultsContainerElem.innerHTML = '<div class="loading-spinner" style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-pulse"></i> Поиск...</div>';
    resultsContainerElem.style.display = "flex";
    resultsStatsElem.style.display = "block";
    newsSectionElem.style.display = "none";
    
    try {
        // Поиск через все API
        var apiResults = [];
        if (typeof searchAllAPIs === 'function') {
            apiResults = await searchAllAPIs(searchTerm);
        } else {
            apiResults = await searchKinopoiskAPI(searchTerm);
        }
        
        // Разделяем по типам
        var movies = apiResults.filter(function(item) { 
            return item.type === 'movie' || item.type === 'series'; 
        });
        var games = apiResults.filter(function(item) { 
            return item.type === 'game'; 
        });
        var books = apiResults.filter(function(item) { 
            return item.type === 'book'; 
        });
        
        // Поиск в локальной базе
        var localResults = contentDatabase.filter(function(item) {
            return (item.title && item.title.toLowerCase().indexOf(searchTerm) !== -1) ||
                   (item.description && item.description.toLowerCase().indexOf(searchTerm) !== -1);
        });
        
        // Фильтр по типу
        if (currentCategory !== "all") {
            localResults = localResults.filter(function(item) { return item.type === currentCategory; });
            if (currentCategory === 'movie' || currentCategory === 'series') {
                movies = movies.concat(localResults);
            } else if (currentCategory === 'game') {
                games = games.concat(localResults);
            } else if (currentCategory === 'book') {
                books = books.concat(localResults);
            }
        } else {
            // Добавляем локальные результаты в соответствующие категории
            localResults.forEach(function(item) {
                if (item.type === 'movie' || item.type === 'series') {
                    var exists = movies.some(function(m) { return m.title === item.title; });
                    if (!exists) movies.push(item);
                } else if (item.type === 'game') {
                    var exists = games.some(function(g) { return g.title === item.title; });
                    if (!exists) games.push(item);
                } else if (item.type === 'book') {
                    var exists = books.some(function(b) { return b.title === item.title; });
                    if (!exists) books.push(item);
                }
            });
        }
        
        // Поиск в новостях
        var filteredNews = newsDatabase.filter(function(news) {
            return (news.title && news.title.toLowerCase().indexOf(searchTerm) !== -1) ||
                   (news.description && news.description.toLowerCase().indexOf(searchTerm) !== -1);
        });
        
        var totalResults = movies.length + games.length + books.length + filteredNews.length;
        document.getElementById('resultCount').innerText = totalResults;
        
        if (totalResults === 0) {
            resultsContainerElem.innerHTML = '<div class="empty-state">Ничего не найдено по запросу "' + escapeHtml(searchTerm) + '"</div>';
            isLoading = false;
            return;
        }
        
        var html = '';
        
        if (movies.length > 0) {
            html += renderMovies(movies);
        }
        
        if (games.length > 0) {
            html += renderGames(games);
        }
        
        if (books.length > 0) {
            html += renderBooks(books);
        }
        
        if (filteredNews.length > 0) {
            html += renderNewsResults(filteredNews);
        }
        
        resultsContainerElem.innerHTML = html;
        
        var favBtns = document.querySelectorAll('.favorite-star-btn');
        for (var i = 0; i < favBtns.length; i++) {
            (function(btn) {
                btn.onclick = function(e) {
                    e.stopPropagation();
                    toggleFavorite(btn.dataset.id, btn.dataset.type);
                };
            })(favBtns[i]);
        }
        
        var cards = document.querySelectorAll('.result-card');
        for (var j = 0; j < cards.length; j++) {
            (function(card) {
                card.addEventListener('click', function(e) {
                    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
                    addCurrentToRecent(parseInt(card.dataset.id, 10), card.dataset.type);
                });
            })(cards[j]);
        }
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        resultsContainerElem.innerHTML = '<div class="empty-state">Ошибка поиска. Попробуйте позже.</div>';
    } finally {
        isLoading = false;
    }
}

// ========== СТРАНИЦА ИЗБРАННОГО ==========
function renderFavoritesPage() {
    var newsSectionElem = document.getElementById('newsSection');
    newsSectionElem.style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    if (!currentUser) {
        resultsContainer.innerHTML = '<div class="empty-state">Войдите в аккаунт, чтобы видеть избранное</div>';
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    
    var favNews = newsDatabase.filter(function(n) { return favoriteNews.indexOf(n.id) !== -1; });
    var favContent = contentDatabase.filter(function(item) { return favorites.indexOf(item.id) !== -1; });
    var total = favNews.length + favContent.length;
    document.getElementById('resultCount').innerText = total;
    
    if (total === 0) {
        resultsContainer.innerHTML = '<div class="empty-state">У вас пока нет избранного</div>';
        return;
    }
    
    var html = '';
    
    if (favContent.length > 0) {
        html += '<h3 style="margin:0 0 1rem 0;">🎬 Контент (' + favContent.length + ')</h3>';
        for (var u = 0; u < favContent.length; u++) {
            var item = favContent[u];
            var links = getLinksByType(item);
            var imageUrl = item.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
            var linksHtml3 = '';
            for (var v = 0; v < links.length; v++) {
                linksHtml3 += '<a href="' + links[v].url + '" target="_blank" class="link-btn">' + links[v].text + '</a>';
            }
            html += '<div class="result-card">' +
                '<div class="card-image" style="background-image: url(' + imageUrl + ');"></div>' +
                '<div class="card-content">' +
                '<div class="card-header">' +
                '<span class="content-type">' + getTypeLabel(item.type) + '</span>' +
                '<button class="favorite-star-btn active" data-id="' + item.id + '" data-type="content" onclick="toggleFavorite(' + item.id + ', \'content\')">★</button>' +
                '</div>' +
                '<div class="title">' + escapeHtml(item.title) + '</div>' +
                '<div class="links-section">' + linksHtml3 + '</div>' +
                '</div>' +
                '</div>';
        }
    }
    
    if (favNews.length > 0) {
        html += '<h3 style="margin:1.5rem 0 1rem 0;">📰 Новости (' + favNews.length + ')</h3>';
        for (var w = 0; w < favNews.length; w++) {
            var news2 = favNews[w];
            html += '<div class="news-card" style="margin-bottom:1rem;">' +
                '<div class="news-header">' +
                '<span class="news-category">' + escapeHtml(news2.category) + '</span>' +
                '<span class="news-date">' + escapeHtml(news2.date) + '</span>' +
                '<button class="favorite-star-btn active" data-id="' + news2.id + '" data-type="news" onclick="toggleFavorite(' + news2.id + ', \'news\')">★</button>' +
                '</div>' +
                '<div class="news-title" onclick="window.open(\'' + news2.url + '\', \'_blank\')">' + escapeHtml(news2.title) + '</div>' +
                '<div class="news-desc">' + escapeHtml(news2.description) + '</div>' +
                '<div class="news-link" onclick="window.open(\'' + news2.url + '\', \'_blank\')">Читать подробнее →</div>' +
                '</div>';
        }
    }
    
    resultsContainer.innerHTML = html;
}

// ========== СТРАНИЦА НЕДАВНИХ ==========
function renderRecentPage() {
    var newsSectionElem = document.getElementById('newsSection');
    newsSectionElem.style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    if (!currentUser) {
        resultsContainer.innerHTML = '<div class="empty-state">Войдите в аккаунт, чтобы видеть историю просмотров</div>';
        document.getElementById('resultCount').innerText = "0";
        return;
    }
    
    var recentItems = getRecentItems();
    var totalCount = recentItems.length;
    document.getElementById('resultCount').innerText = totalCount;
    
    if (totalCount === 0) {
        resultsContainer.innerHTML = '<div class="empty-state">История просмотров пуста</div>';
        return;
    }
    
    var contentItems = recentItems.filter(function(item) { return item.type !== 'news'; });
    var newsItems = recentItems.filter(function(item) { return item.type === 'news'; });
    
    var html = '<div style="display:flex; justify-content:flex-end; margin-bottom:1rem;"><button id="clearHistoryBtn" style="background:none; border:1px solid #ebebeb; padding:0.3rem 0.8rem; border-radius:6px; cursor:pointer; font-size:0.7rem; color:#c0392b;">Очистить историю</button></div>';
    
    if (contentItems.length > 0) {
        html += '<h3 style="margin:0 0 1rem 0;">🎬 Просмотренный контент (' + contentItems.length + ')</h3>';
        for (var x = 0; x < contentItems.length; x++) {
            var item2 = contentItems[x];
            var imageUrl2 = item2.image || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
            var fullItem = contentDatabase.find(function(dbItem) { return dbItem.id == item2.id; });
            var links2 = fullItem ? getLinksByType(fullItem) : [];
            var linksHtml4 = '';
            for (var y = 0; y < links2.length; y++) {
                linksHtml4 += '<a href="' + links2[y].url + '" target="_blank" class="link-btn">' + links2[y].text + '</a>';
            }
            html += '<div class="result-card recent-item">' +
                '<div class="card-image" style="background-image: url(' + imageUrl2 + ');"></div>' +
                '<div class="card-content">' +
                '<div class="card-header">' +
                '<span class="content-type">' + getTypeLabel(item2.type) + '</span>' +
                '<div><button class="remove-recent-btn" data-id="' + item2.id + '" style="background:none; border:none; cursor:pointer; color:#ccc;"><i class="fas fa-times-circle"></i></button></div>' +
                '</div>' +
                '<div class="title">' + escapeHtml(item2.title) + '</div>' +
                '<div class="description" style="font-size:0.7rem; color:#aaa;">Просмотрено: ' + item2.date + '</div>' +
                '<div class="links-section">' + linksHtml4 + '</div>' +
                '</div>' +
                '</div>';
        }
    }
    
    if (newsItems.length > 0) {
        html += '<h3 style="margin:1.5rem 0 1rem 0;">📰 Просмотренные новости (' + newsItems.length + ')</h3>';
        for (var z = 0; z < newsItems.length; z++) {
            var item3 = newsItems[z];
            html += '<div class="news-card recent-news-item" style="margin-bottom:1rem;">' +
                '<div class="news-header">' +
                '<span class="news-category">' + escapeHtml(item3.category || 'Новости') + '</span>' +
                '<span class="news-date">' + escapeHtml(item3.date) + '</span>' +
                '<div><button class="remove-recent-news-btn" data-id="' + item3.id + '" style="background:none; border:none; cursor:pointer; color:#ccc;"><i class="fas fa-times-circle"></i></button></div>' +
                '</div>' +
                '<div class="news-title" onclick="window.open(\'' + item3.url + '\', \'_blank\')">' + escapeHtml(item3.title) + '</div>' +
                '<div class="news-desc">' + escapeHtml(item3.description || '') + '</div>' +
                '<div class="news-link" onclick="window.open(\'' + item3.url + '\', \'_blank\')">Читать подробнее →</div>' +
                '</div>';
        }
    }
    
    resultsContainer.innerHTML = html;
    
    var removeBtns = document.querySelectorAll('.remove-recent-btn, .remove-recent-news-btn');
    for (var aa = 0; aa < removeBtns.length; aa++) {
        (function(btn) {
            btn.onclick = function() {
                var id = parseInt(btn.dataset.id, 10);
                removeFromRecent(id);
            };
        })(removeBtns[aa]);
    }
    
    var clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) clearBtn.onclick = function() { clearRecentHistory(); };
}

// ========== СТРАНИЦА КОЛЛЕКЦИЙ ==========
function renderCollectionsPage() {
    var newsSectionElem = document.getElementById('newsSection');
    newsSectionElem.style.display = "none";
    resultsContainer.style.display = "flex";
    resultsStatsBlock.style.display = "block";
    
    var collections = [
        { name: "Игры от CD Projekt RED", items: ["Ведьмак 3", "Cyberpunk 2077"] },
        { name: "Фильмы Кристофера Нолана", items: ["Интерстеллар", "Оппенгеймер"] },
        { name: "Книги по вселенной Ведьмака", items: ["Последнее желание", "Меч Предназначения"] },
        { name: "Лучшие игры 2023-2024", items: ["Baldur's Gate 3", "Alan Wake 2", "The Last of Us Part I"] }
    ];
    
    document.getElementById('resultCount').innerText = collections.length;
    
    var html = '<div class="collections-page">' +
        '<h3 style="margin-bottom: 1.5rem;">📁 Наши коллекции</h3>';
    
    for (var ab = 0; ab < collections.length; ab++) {
        var c = collections[ab];
        var tagsHtml = '';
        for (var ac = 0; ac < c.items.length; ac++) {
            tagsHtml += '<span class="collection-tag" style="display: inline-block; background: #e8e8e8; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; cursor: pointer; margin: 0.2rem;" onclick="document.getElementById(\'searchInput\').value=\'' + c.items[ac] + '\'; document.getElementById(\'searchBtn\').click()">' + c.items[ac] + '</span>';
        }
        html += '<div class="collection-card" style="background: #fafafa; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; border: 1px solid #ebebeb;">' +
            '<h4 style="margin-bottom: 0.5rem;">' + c.name + '</h4>' +
            '<div class="collection-items" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">' + tagsHtml + '</div>' +
            '</div>';
    }
    
    html += '</div>';
    resultsContainer.innerHTML = html;
}

// ========== АВТОРИЗАЦИЯ ==========
function openModal() { if (authModal) authModal.style.display = "flex"; }
function closeModal() { if (authModal) authModal.style.display = "none"; }

function switchTab(tab) {
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var tabs = document.querySelectorAll('.tab-btn');
    for (var ad = 0; ad < tabs.length; ad++) {
        tabs[ad].classList.remove('active');
    }
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
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var errorEl = document.getElementById('loginPasswordError');
    
    if (errorEl) errorEl.textContent = '';
    
    if (!email || !password) {
        alert('Заполните все поля');
        return;
    }
    
    var passwordCheck = validatePassword(password);
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
    
    var savedFav = localStorage.getItem('favorites_' + email);
    var savedFavNews = localStorage.getItem('favoriteNews_' + email);
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
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;
    var password2 = document.getElementById('regPassword2').value;
    var errorEl = document.getElementById('regPasswordError');
    
    if (errorEl) errorEl.textContent = '';
    
    if (!name || !email || !password) {
        alert('Заполните все поля');
        return;
    }
    
    var passwordCheck = validatePassword(password);
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
        localStorage.setItem('favorites_' + currentUser.email, JSON.stringify(favorites));
        localStorage.setItem('favoriteNews_' + currentUser.email, JSON.stringify(favoriteNews));
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
    var userMenu = document.getElementById('userMenu');
    var showAuthBtn = document.getElementById('showAuthBtn');
    var userNameSpan = document.getElementById('userName');
    var userAvatar = document.getElementById('userAvatar');
    var adminPanel = document.getElementById('adminPanel');
    
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
    var menuItems = document.querySelectorAll('.sidebar-menu li');
    for (var ae = 0; ae < menuItems.length; ae++) {
        menuItems[ae].classList.remove('active');
        if (menuItems[ae].dataset.page === page) menuItems[ae].classList.add('active');
    }
    
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
async function updateAllNews() {
    var refreshBtn = document.getElementById('refreshNewsBtn');
    if (refreshBtn) {
        refreshBtn.innerHTML = '⏳ Загрузка...';
        refreshBtn.disabled = true;
    }
    
    showToast('🔄 Обновление новостей...');
    
    // Используем только демо-новости (RSS отключен)
    var demoNews = [
        { category: "🎮 Игры", title: "Новый трейлер GTA 6 набрал 100 млн просмотров", description: "Рекордный трейлер долгожданной игры побил все ожидания.", date: new Date().toLocaleString(), url: "https://www.rockstargames.com/gta-vi" },
        { category: "🎬 Фильмы", title: "Дэдпул 3: первые отзывы критиков", description: "Критики в восторге от триквела с Райаном Рейнольдсом.", date: new Date().toLocaleString(), url: "https://www.marvel.com/movies/deadpool-3" },
        { category: "📺 Сериалы", title: "Fallout продлён на 2 сезон", description: "Amazon Prime Video подтвердил продолжение хита по мотивам игры.", date: new Date().toLocaleString(), url: "https://www.amazon.com/Fallout" },
        { category: "🎮 Игры", title: "CD Projekt RED анонсировала новую игру во вселенной Ведьмака", description: "Студия подтвердила разработку следующей части саги на Unreal Engine 5.", date: new Date().toLocaleString(), url: "https://www.thewitcher.com/ru/" },
        { category: "🎬 Фильмы", title: "Дюна 2 собрала 700 миллионов долларов в прокате", description: "Продолжение эпической саги Дени Вильнёва продолжает бить рекорды.", date: new Date().toLocaleString(), url: "https://www.kinopoisk.ru/film/dyuna-chast-vtoraya-2024/" },
        { category: "📚 Книги", title: "Новая книга о Гарри Поттере выйдет в 2025", description: "Джоан Роулинг работает над расширением магической вселенной.", date: new Date().toLocaleString(), url: "https://www.bloomsbury.com/uk/discover/harry-potter/" }
    ];
    
    var added = 0;
    for (var i = 0; i < demoNews.length; i++) {
        var news = demoNews[i];
        var exists = false;
        for (var j = 0; j < newsDatabase.length; j++) {
            if (newsDatabase[j].title === news.title) {
                exists = true;
                break;
            }
        }
        if (!exists) {
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
        showToast('✅ Добавлено ' + added + ' новостей!');
    } else {
        showToast("Новости актуальны!");
    }
    
    if (refreshBtn) {
        refreshBtn.innerHTML = '🔄 Свежие';
        refreshBtn.disabled = false;
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    resultsContainer = document.getElementById('resultsContainer');
    resultsStatsBlock = document.getElementById('resultsStats');
    newsSection = document.getElementById('newsSection');
    authModal = document.getElementById('authModal');
    newsModal = document.getElementById('newsModal');
    
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') performSearch(); });
    
    var filters = document.querySelectorAll('.type-filters li');
    for (var ah = 0; ah < filters.length; ah++) {
        (function(filter) {
            filter.addEventListener('click', function() {
                var allFilters = document.querySelectorAll('.type-filters li');
                for (var ai = 0; ai < allFilters.length; ai++) {
                    allFilters[ai].classList.remove('active');
                }
                filter.classList.add('active');
                currentCategory = filter.dataset.category;
                if (currentPage === "home" && currentQuery) performSearch();
            });
        })(filters[ah]);
    }
    
    var menuItems2 = document.querySelectorAll('.sidebar-menu li');
    for (var aj = 0; aj < menuItems2.length; aj++) {
        (function(item) {
            item.addEventListener('click', function() { navigateTo(item.dataset.page); });
        })(menuItems2[aj]);
    }
    
    // Обработчики для модального окна авторизации
    var showAuthBtn = document.getElementById('showAuthBtn');
    var closeModalBtn = document.getElementById('closeModalBtn');
    var loginBtn = document.getElementById('loginBtn');
    var registerBtn = document.getElementById('registerBtn');
    var logoutBtn = document.getElementById('logoutBtn');
    var tabBtns = document.querySelectorAll('.tab-btn');
    
    if (showAuthBtn) showAuthBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (registerBtn) registerBtn.addEventListener('click', handleRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    for (var ak = 0; ak < tabBtns.length; ak++) {
        (function(btn) {
            btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
        })(tabBtns[ak]);
    }
    
    // Обработчики для модального окна новостей
    var closeNewsModalBtn = document.getElementById('closeNewsModalBtn');
    var newsCancelBtn = document.getElementById('newsCancelBtn');
    var newsSaveBtn = document.getElementById('newsSaveBtn');
    var adminAddBtn = document.getElementById('adminAddNewsBtn');
    var adminUpdateBtn = document.getElementById('adminUpdateNewsBtn');
    var refreshBtn = document.getElementById('refreshNewsBtn');
    
    if (closeNewsModalBtn) closeNewsModalBtn.addEventListener('click', closeNewsModal);
    if (newsCancelBtn) newsCancelBtn.addEventListener('click', closeNewsModal);
    if (newsSaveBtn) newsSaveBtn.addEventListener('click', saveNewsFromModal);
    if (adminAddBtn) adminAddBtn.addEventListener('click', function() { openNewsModal(); });
    if (adminUpdateBtn) adminUpdateBtn.addEventListener('click', updateAllNews);
    if (refreshBtn) refreshBtn.addEventListener('click', updateAllNews);
    
    // Автообновление новостей
    setTimeout(function() {
        updateAllNews();
    }, 2000);
    
    setInterval(function() {
        updateAllNews();
    }, 15 * 60 * 1000);
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateAllNews();
        }
    });
    
    // Закрытие модалок по клику вне окна
    window.addEventListener('click', function(e) {
        if (e.target === authModal) closeModal();
        if (e.target === newsModal) closeNewsModal();
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
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

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========
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
window.renderNews = renderNews;
window.renderFavoritesPage = renderFavoritesPage;
window.renderRecentPage = renderRecentPage;
window.renderCollectionsPage = renderCollectionsPage;

console.log('✅ app.js загружен');
