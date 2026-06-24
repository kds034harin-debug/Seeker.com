// ============================================================
// ========== НАСТРОЙКА API КЛЮЧЕЙ ==========
// ============================================================

// 1. Кинопоиск
const KINOPOISK_API_KEY = 'd0fa7c30-6035-4f8c-907b-0e7c81738ee3';
const KINOPOISK_API_URL = 'https://kinopoiskapiunofficial.tech/api';

// 2. Google Books
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAjhurxN3r8j4MjEzFDW6fIBXkgKDZzbOs';

// 3. IGDB / Twitch (для игр) - опционально
const IGDB_CLIENT_ID = '';
const IGDB_ACCESS_TOKEN = '';

// 4. RSS - ВРЕМЕННО ОТКЛЮЧАЕМ
const USE_RSS = false;

// ============================================================
// ========== КОНЕЦ НАСТРОЙКИ ==========
// ============================================================

const MAX_PAGES = 5;
const FILMS_PER_PAGE = 10;

// ============================================================
// ========== API КИНОПОИСКА ==========
// ============================================================

async function searchKinopoiskAPI(query) {
    if (!query || query.trim() === '') return [];

    console.log('🔍 Поиск на Кинопоиске:', query);
    
    try {
        var url = KINOPOISK_API_URL + 
            '/v2.1/films/search-by-keyword?keyword=' + 
            encodeURIComponent(query) + 
            '&page=1';

        var response = await fetch(url, {
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

        var data = await response.json();
        
        if (!data.films || data.films.length === 0) {
            console.log('❌ Ничего не найдено');
            return [];
        }

        var allFilms = data.films.map(function(film) {
            return {
                id: 'kp_' + film.filmId,
                type: film.type === "TV_SERIES" ? "series" : "movie",
                title: film.nameRu || film.nameEn || 'Без названия',
                year: film.year,
                rating: film.rating,
                description: film.description || "Описание отсутствует",
                image: film.posterUrl || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                source: "Кинопоиск",
                links: { watch: "https://www.kinopoisk.ru/film/" + film.filmId + "/" }
            };
        });

        console.log('✅ Загружено фильмов:', allFilms.length);
        return allFilms;

    } catch (error) {
        console.error('Ошибка API Кинопоиска:', error);
        return [];
    }
}

// ============================================================
// ========== GOOGLE BOOKS API ==========
// ============================================================

async function searchGoogleBooks(query) {
    if (!query || query.trim() === '') return [];
    
    console.log('📚 Поиск книг в Google Books:', query);
    
    try {
        var apiUrl = 'https://www.googleapis.com/books/v1/volumes?q=' + 
                     encodeURIComponent(query) + 
                     '&maxResults=10' + 
                     '&orderBy=relevance' +
                     '&key=' + GOOGLE_BOOKS_API_KEY;
        
        console.log('📡 Запрос к Google Books');
        
        var response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error('Google Books API ошибка:', response.status);
            return [];
        }
        
        var data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
            console.log('✅ Найдено книг:', data.items.length);
            
            return data.items.map(function(book) {
                var volume = book.volumeInfo || {};
                var description = volume.description ? volume.description.replace(/<[^>]*>/g, '') : 'Описание отсутствует';
                
                var imageUrl = 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
                if (volume.imageLinks) {
                    imageUrl = volume.imageLinks.thumbnail || 
                               volume.imageLinks.smallThumbnail || 
                               imageUrl;
                    imageUrl = imageUrl.replace('http://', 'https://');
                }
                
                return {
                    id: 'book_' + book.id,
                    type: "book",
                    title: volume.title || 'Без названия',
                    year: volume.publishedDate ? volume.publishedDate.split('-')[0] : null,
                    rating: volume.averageRating ? volume.averageRating.toFixed(1) : null,
                    description: description.substring(0, 350),
                    image: imageUrl,
                    author: volume.authors ? volume.authors.join(', ') : 'Автор не указан',
                    pages: volume.pageCount || "—",
                    source: "Google Books",
                    links: { buy: volume.infoLink || '#' }
                };
            });
        }
        
        console.log('❌ Книги не найдены');
        return [];
    } catch (error) {
        console.error('❌ Ошибка Google Books:', error.message);
        return [];
    }
}

// ============================================================
// ========== API ДЛЯ ИГР (IGDB) - опционально ==========
// ============================================================

async function searchIGDB(query) {
    if (!query || query.trim() === '') return [];
    if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
        return [];
    }
    
    try {
        var url = 'https://api.igdb.com/v4/games';
        var searchQuery = 'search "' + query + '"; fields name,summary,first_release_date,cover.url,genres.name,platforms.name,rating,total_rating,involved_companies.company.name; limit 5;';
        
        var response = await fetch(url, {
            method: 'POST',
            headers: {
                'Client-ID': IGDB_CLIENT_ID,
                'Authorization': 'Bearer ' + IGDB_ACCESS_TOKEN,
                'Content-Type': 'text/plain'
            },
            body: searchQuery
        });
        
        if (!response.ok) {
            console.error('IGDB API ошибка:', response.status);
            return [];
        }
        
        var data = await response.json();
        
        if (data && data.length > 0) {
            return data.map(function(game) {
                var imageUrl = game.cover && game.cover.url ? game.cover.url.replace('//', 'https://') : 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
                return {
                    id: 'igdb_' + game.id,
                    type: "game",
                    title: game.name || 'Без названия',
                    year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
                    rating: game.rating ? (game.rating / 10).toFixed(1) : null,
                    description: game.summary ? game.summary.substring(0, 300) : "Описание отсутствует",
                    image: imageUrl,
                    developer: game.involved_companies && game.involved_companies[0] && game.involved_companies[0].company ? game.involved_companies[0].company.name : "—",
                    platforms: game.platforms ? game.platforms.map(function(p) { return p.name; }).join(', ') : "—",
                    genre: game.genres ? game.genres.map(function(g) { return g.name; }).join(', ') : "—",
                    source: "IGDB",
                    links: { buy: "https://www.google.com/search?q=" + encodeURIComponent(game.name || '') + "+купить" }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Ошибка IGDB API:', error);
        return [];
    }
}

// ============================================================
// ========== ПОИСК ИГР В ЛОКАЛЬНОЙ БАЗЕ ==========
// ============================================================

async function searchGamesInLocalDB(query) {
    if (!query || query.trim() === '') return [];
    
    var results = contentDatabase.filter(function(item) {
        return item.type === 'game' && 
               (item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
                (item.description && item.description.toLowerCase().indexOf(query.toLowerCase()) !== -1));
    });
    
    console.log('🎮 Найдено игр в локальной базе:', results.length);
    return results;
}

// ============================================================
// ========== RSS (ОТКЛЮЧЕН) ==========
// ============================================================

async function fetchRSSFeed(url) {
    if (!USE_RSS) return null;
    // ... остальной код
}

async function fetchAllNewsFromRSS() {
    if (!USE_RSS) {
        console.log('📰 RSS отключен');
        return [];
    }
    // ... остальной код
}

// ============================================================
// ========== УНИВЕРСАЛЬНЫЙ ПОИСК ==========
// ============================================================

async function searchAllAPIs(query) {
    console.log('🔍 Универсальный поиск:', query);
    
    try {
        var [movies, books, games, localGames] = await Promise.all([
            searchKinopoiskAPI(query),
            searchGoogleBooks(query),
            searchIGDB(query),
            searchGamesInLocalDB(query)
        ]);
        
        // Добавляем локальные игры
        if (localGames.length > 0) {
            games = games.concat(localGames);
            console.log('🎮 Игр после добавления локальных:', games.length);
        }
        
        var allResults = movies.concat(games).concat(books);
        
        console.log('📊 Результаты:');
        console.log('   🎬 Фильмы/сериалы:', movies.length);
        console.log('   🎮 Игры:', games.length);
        console.log('   📚 Книги:', books.length);
        console.log('   📌 Всего:', allResults.length);
        
        return allResults;
    } catch (error) {
        console.error('❌ Ошибка при поиске:', error);
        return [];
    }
}

// ============================================================
// ========== ЭКСПОРТ ==========
// ============================================================

window.searchKinopoiskAPI = searchKinopoiskAPI;
window.searchGoogleBooks = searchGoogleBooks;
window.searchIGDB = searchIGDB;
window.searchAllAPIs = searchAllAPIs;
window.searchGamesInLocalDB = searchGamesInLocalDB;

console.log('✅ API модуль загружен');
console.log('📌 Кинопоиск API: ✅ настроен');
console.log('📌 Google Books API: ' + (GOOGLE_BOOKS_API_KEY && GOOGLE_BOOKS_API_KEY.trim() !== '' ? '✅ настроен' : '❌ не настроен'));
console.log('📌 IGDB API: ' + (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN ? '✅ настроен' : '❌ не настроен'));
console.log('📌 RSS: ❌ ОТКЛЮЧЕН');
