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

const modal = document.getElementById('authModal');

// ========== ЗАГРУЗКА API КЛЮЧЕЙ ИЗ КОНФИГА ==========
// Пытаемся загрузить config.js
let API_CONFIG = null;
try {
    // config.js должен загружаться перед api.js
    if (typeof window !== 'undefined' && window.API_CONFIG) {
        API_CONFIG = window.API_CONFIG;
    }
} catch(e) {
    console.warn('config.js не загружен, используем fallback значения');
}

// Фолбэк значения (только для демо, для реальной работы нужен config.js)
const KINOPOISK_API_KEY = API_CONFIG?.KINOPOISK_API_KEY || '';
const IGDB_CLIENT_ID = API_CONFIG?.IGDB_CLIENT_ID || '';
const IGDB_ACCESS_TOKEN = API_CONFIG?.IGDB_ACCESS_TOKEN || '';
const GOOGLE_BOOKS_API_KEY = API_CONFIG?.GOOGLE_BOOKS_API_KEY || '';

const KINOPOISK_API_URL = 'https://kinopoiskapiunofficial.tech/api';

// Проверка наличия ключей
if (!KINOPOISK_API_KEY) {
    console.warn('⚠️ API ключ Кинопоиска не настроен! Добавьте его в js/config.js');
}

// ========== API КИНОПОИСКА (Фильмы и сериалы) ==========
async function searchKinopoiskAPI(query) {
    if (!KINOPOISK_API_KEY) {
        console.log('Кинопоиск API не настроен');
        return [];
    }
    
    try {
        const url = `${KINOPOISK_API_URL}/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=1`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('API ошибка:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        if (data && data.films && data.films.length > 0) {
            return data.films.map(film => ({
                id: `kp_${film.filmId}`,
                type: film.type === "TV_SERIES" ? "series" : "movie",
                title: film.nameRu || film.nameEn,
                year: film.year,
                rating: film.rating,
                description: film.description || "Описание отсутствует",
                image: film.posterUrl,
                director: "—",
                cast: "—",
                duration: "—",
                source: "Кинопоиск",
                links: { watch: `https://www.kinopoisk.ru/film/${film.filmId}/` }
            }));
        }
        return [];
    } catch (error) {
        console.error('Ошибка API Кинопоиска:', error);
        return [];
    }
}

// ========== API ДЛЯ ИГР (IGDB / Twitch) ==========
async function searchIGDB(query) {
    if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
        console.log('IGDB API не настроен. Пропускаем поиск игр.');
        return [];
    }
    
    try {
        const url = 'https://api.igdb.com/v4/games';
        const searchQuery = `search "${query}"; fields name,summary,first_release_date,cover.url,genres.name,platforms.name,rating,total_rating,involved_companies.company.name; limit 5;`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Client-ID': IGDB_CLIENT_ID,
                'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
                'Content-Type': 'text/plain'
            },
            body: searchQuery
        });
        
        if (!response.ok) {
            console.error('IGDB API ошибка:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            return data.map(game => ({
                id: `igdb_${game.id}`,
                type: "game",
                title: game.name,
                year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
                rating: game.rating ? (game.rating / 10).toFixed(1) : null,
                description: game.summary ? game.summary.substring(0, 300) : "Описание отсутствует",
                image: game.cover?.url ? game.cover.url.replace('//', 'https://') : null,
                developer: game.involved_companies?.[0]?.company?.name || "—",
                platforms: game.platforms?.map(p => p.name).join(', ') || "—",
                genre: game.genres?.map(g => g.name).join(', ') || "—",
                source: "IGDB",
                links: { buy: `https://www.google.com/search?q=${encodeURIComponent(game.name)}+купить` }
            }));
        }
        return [];
    } catch (error) {
        console.error('Ошибка IGDB API:', error);
        return [];
    }
}

// ========== API ДЛЯ КНИГ (Google Books) ==========
// ========== API ДЛЯ КНИГ (Google Books) - ИСПРАВЛЕННЫЙ ==========
async function searchGoogleBooks(query) {
    if (!query || query.trim() === '') return [];
    
    try {
        // Используем CORS-прокси для обхода блокировок
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        const data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
            return data.items.map(book => {
                const volume = book.volumeInfo;
                return {
                    id: `book_${book.id}`,
                    type: "book",
                    title: volume.title || 'Без названия',
                    year: volume.publishedDate ? volume.publishedDate.split('-')[0] : null,
                    rating: volume.averageRating ? volume.averageRating.toFixed(1) : null,
                    description: volume.description ? volume.description.replace(/<[^>]*>/g, '').substring(0, 300) : 'Описание отсутствует',
                    image: volume.imageLinks?.thumbnail || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                    author: volume.authors ? volume.authors.join(', ') : 'Автор не указан',
                    pages: volume.pageCount || "—",
                    source: "Google Books",
                    links: { buy: volume.infoLink || '#' }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Ошибка Google Books:', error);
        return [];
    }
}

// ========== УНИВЕРСАЛЬНЫЙ ПОИСК ==========
// ========== УНИВЕРСАЛЬНЫЙ ПОИСК ==========
async function searchAllAPIs(query) {
    console.log('Поиск по запросу:', query);
    
    const [movies, games, books] = await Promise.all([
        searchKinopoiskAPI(query),
        searchIGDB(query),
        searchGoogleBooks(query)
    ]);
    
    console.log(`Результаты: фильмы/сериалы - ${movies.length}, игры - ${games.length}, книги - ${books.length}`);
    
    return [...movies, ...games, ...books];
}
// ========== ОСТАЛЬНОЙ КОД (renderNews, renderCards, performSearch и т.д.) ==========
// ... (весь остальной код из вашего api.js остаётся без изменений)
// ... (функции renderNews, renderCards, performSearch, renderFavoritesPage, 
//      renderRecentPage, renderCollectionsPage, авторизация, навигация и т.д.)