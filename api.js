// ============================================================
// ========== НАСТРОЙКА API КЛЮЧЕЙ ==========
// ============================================================

// 1. Кинопоиск
const KINOPOISK_API_KEY = 'd0fa7c30-6035-4f8c-907b-0e7c81738ee3';
const KINOPOISK_API_URL = 'https://kinopoiskapiunofficial.tech/api';

// 2. IGDB / Twitch (для игр) - ВСТАВЬТЕ СВОИ КЛЮЧИ
const IGDB_CLIENT_ID = ''; // Вставьте Client-ID
const IGDB_ACCESS_TOKEN = ''; // Вставьте Access Token

// 3. Google Books - ВСТАВЬТЕ СВОЙ КЛЮЧ
// Получить: https://console.cloud.google.com/ → APIs & Services → Credentials
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAjhurxN3r8j4MjEzFDW6fIBXkgKDZzbOs'; // Вставьте свой ключ

// 4. NewsAPI - ОТКЛЮЧАЕМ (ошибка SSL)
const USE_NEWS_API = false;

// ============================================================
// ========== КОНЕЦ НАСТРОЙКИ ==========
// ============================================================

const MAX_PAGES = 5;
const FILMS_PER_PAGE = 10;

// ========== API КИНОПОИСКА ==========
async function searchKinopoiskAPI(query) {
    if (!query || query.trim() === '') return [];

    console.log('🔍 Поиск на Кинопоиске:', query);
    
    var allFilms = [];
    var totalPages = 0;

    try {
        var firstUrl = KINOPOISK_API_URL + 
            '/v2.1/films/search-by-keyword?keyword=' + 
            encodeURIComponent(query) + 
            '&page=1';

        var firstResponse = await fetch(firstUrl, {
            method: 'GET',
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!firstResponse.ok) {
            console.error('API ошибка:', firstResponse.status);
            return [];
        }

        var firstData = await firstResponse.json();
        
        if (!firstData.films || firstData.films.length === 0) {
            console.log('❌ Ничего не найдено');
            return [];
        }

        totalPages = firstData.totalPages || 1;
        
        console.log('📊 Всего найдено:', firstData.total || firstData.films.length, 'фильмов, страниц:', totalPages);

        var firstPageFilms = firstData.films.map(function(film) {
            return {
                id: 'kp_' + film.filmId,
                type: film.type === "TV_SERIES" ? "series" : "movie",
                title: film.nameRu || film.nameEn || 'Без названия',
                year: film.year,
                rating: film.rating,
                description: film.description || "Описание отсутствует",
                image: film.posterUrl || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                director: film.director || "—",
                cast: film.cast || "—",
                duration: film.duration || "—",
                source: "Кинопоиск",
                links: { watch: "https://www.kinopoisk.ru/film/" + film.filmId + "/" }
            };
        });

        allFilms = allFilms.concat(firstPageFilms);

        var pagesToLoad = Math.min(totalPages, MAX_PAGES);

        for (var page = 2; page <= pagesToLoad; page++) {
            console.log('📄 Загрузка страницы', page, 'из', pagesToLoad);

            var url = KINOPOISK_API_URL + 
                '/v2.1/films/search-by-keyword?keyword=' + 
                encodeURIComponent(query) + 
                '&page=' + page;

            var response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-KEY': KINOPOISK_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('API ошибка на странице', page, ':', response.status);
                continue;
            }

            var data = await response.json();

            if (!data.films || data.films.length === 0) {
                break;
            }

            var pageFilms = data.films.map(function(film) {
                return {
                    id: 'kp_' + film.filmId,
                    type: film.type === "TV_SERIES" ? "series" : "movie",
                    title: film.nameRu || film.nameEn || 'Без названия',
                    year: film.year,
                    rating: film.rating,
                    description: film.description || "Описание отсутствует",
                    image: film.posterUrl || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                    director: film.director || "—",
                    cast: film.cast || "—",
                    duration: film.duration || "—",
                    source: "Кинопоиск",
                    links: { watch: "https://www.kinopoisk.ru/film/" + film.filmId + "/" }
                };
            });

            allFilms = allFilms.concat(pageFilms);

            if (data.films.length < FILMS_PER_PAGE) {
                break;
            }

            await new Promise(function(resolve) { setTimeout(resolve, 200); });
        }

        console.log('✅ Загружено фильмов:', allFilms.length);
        return allFilms;

    } catch (error) {
        console.error('Ошибка API Кинопоиска:', error);
        return [];
    }
}

// ========== API ДЛЯ ИГР (IGDB / Twitch) ==========
async function searchIGDB(query) {
    if (!query || query.trim() === '') return [];
    if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
        console.log('⚠️ IGDB API не настроен. Пропускаем поиск игр.');
        return [];
    }
    
    try {
        var url = 'https://api.igdb.com/v4/games';
        var searchQuery = 'search "' + query + '"; fields name,summary,first_release_date,cover.url,genres.name,platforms.name,rating,total_rating,involved_companies.company.name; limit 10;';
        
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
                var rating = game.rating ? (game.rating / 10).toFixed(1) : null;
                var platforms = game.platforms ? game.platforms.map(function(p) { return p.name; }).join(', ') : "—";
                var genres = game.genres ? game.genres.map(function(g) { return g.name; }).join(', ') : "—";
                var developer = game.involved_companies && game.involved_companies[0] && game.involved_companies[0].company ? game.involved_companies[0].company.name : "—";
                
                return {
                    id: 'igdb_' + game.id,
                    type: "game",
                    title: game.name || 'Без названия',
                    year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
                    rating: rating,
                    description: game.summary ? game.summary.substring(0, 300) : "Описание отсутствует",
                    image: imageUrl,
                    developer: developer,
                    platforms: platforms,
                    genre: genres,
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

// ========== GOOGLE BOOKS API (ДЛЯ КНИГ) ==========
async function searchGoogleBooks(query) {
    if (!query || query.trim() === '') return [];
    
    console.log('📚 Поиск книг в Google Books:', query);
    
    try {
        var apiUrl = 'https://www.googleapis.com/books/v1/volumes?q=' + 
                     encodeURIComponent(query) + 
                     '&maxResults=15' + 
                     '&orderBy=relevance';
        
        // Добавляем ключ, если он есть
        if (GOOGLE_BOOKS_API_KEY && GOOGLE_BOOKS_API_KEY.trim() !== '') {
            apiUrl += '&key=' + GOOGLE_BOOKS_API_KEY;
        }
        
        // Используем прокси для обхода CORS
        var proxyUrl = 'https://api.allorigins.win/raw?url=';
        var response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        
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
                
                // Получаем картинку (обложку)
                var imageUrl = 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
                if (volume.imageLinks) {
                    imageUrl = volume.imageLinks.thumbnail || 
                               volume.imageLinks.smallThumbnail || 
                               imageUrl;
                    imageUrl = imageUrl.replace('http://', 'https://');
                }
                
                var authors = volume.authors ? volume.authors.join(', ') : 'Автор не указан';
                var publishedYear = volume.publishedDate ? volume.publishedDate.split('-')[0] : null;
                var rating = volume.averageRating ? volume.averageRating.toFixed(1) : null;
                
                return {
                    id: 'book_' + book.id,
                    type: "book",
                    title: volume.title || 'Без названия',
                    year: publishedYear,
                    rating: rating,
                    description: description.substring(0, 350),
                    image: imageUrl,
                    author: authors,
                    pages: volume.pageCount || "—",
                    source: "Google Books",
                    links: { 
                        buy: volume.infoLink || '#' 
                    }
                };
            });
        }
        console.log('❌ Книги не найдены');
        return [];
    } catch (error) {
        console.error('❌ Ошибка Google Books:', error);
        return [];
    }
}

// ========== УНИВЕРСАЛЬНЫЙ ПОИСК ==========
async function searchAllAPIs(query) {
    console.log('🔍 Универсальный поиск по запросу:', query);
    
    try {
        var movies = await searchKinopoiskAPI(query);
        var games = await searchIGDB(query);
        var books = await searchGoogleBooks(query);
        
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

// ========== ЭКСПОРТ ==========
window.searchKinopoiskAPI = searchKinopoiskAPI;
window.searchIGDB = searchIGDB;
window.searchGoogleBooks = searchGoogleBooks;
window.searchAllAPIs = searchAllAPIs;

console.log('✅ API модуль загружен');
console.log('📌 Кинопоиск API: ✅ настроен');
console.log('📌 IGDB API: ' + (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN ? '✅ настроен' : '❌ не настроен (опционально)'));
console.log('📌 Google Books API: ' + (GOOGLE_BOOKS_API_KEY && GOOGLE_BOOKS_API_KEY.trim() !== '' ? '✅ настроен' : '⚠️ работает без ключа'));
