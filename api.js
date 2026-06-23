// ============================================================
// ========== НАСТРОЙКА API КЛЮЧЕЙ ==========
// ============================================================

// 1. Кинопоиск
const KINOPOISK_API_KEY = 'd0fa7c30-6035-4f8c-907b-0e7c81738ee3';
const KINOPOISK_API_URL = 'https://kinopoiskapiunofficial.tech/api';

// 2. IGDB / Twitch (для игр) - ВАШИ ДАННЫЕ
const IGDB_CLIENT_ID = 'ioi10i8wb2uk3fo6cjg30wxfe5e40w';
const IGDB_ACCESS_TOKEN = '_______ПОЛУЧИТЬ_ЧЕРЕЗ_ЗАПРОС_______';

// 3. Google Books
const GOOGLE_BOOKS_API_KEY = '';

// 4. NewsAPI - ОТКЛЮЧАЕМ (ошибка SSL)
const USE_NEWS_API = false; // ← ВЫКЛЮЧАЕМ NewsAPI

// ============================================================
// ========== КОНЕЦ НАСТРОЙКИ ==========
// ============================================================

const MAX_PAGES = 5;
const FILMS_PER_PAGE = 10;

// ========== НОВОСТНЫЕ ИСТОЧНИКИ (только RSS) ==========
const NEWS_SOURCES = {
    KINOPOISK: {
        name: 'Кинопоиск',
        url: 'https://www.kinopoisk.ru/news/rss/',
        icon: '🎬',
        category: 'Фильмы'
    },
    FILM_RU: {
        name: 'Film.ru',
        url: 'https://www.film.ru/rss/news',
        icon: '📽️',
        category: 'Кино'
    },
    IGN: {
        name: 'IGN Russia',
        url: 'https://www.ign.com/rss/articles',
        icon: '🎮',
        category: 'Игры'
    },
    LITRES: {
        name: 'ЛитРес',
        url: 'https://www.litres.ru/static/rss/news.xml',
        icon: '📚',
        category: 'Книги'
    }
};

// ========== RSS ПАРСИНГ ==========
async function fetchRSSFeed(url) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(url));
        
        if (!response.ok) {
            console.error('Ошибка загрузки RSS:', response.status);
            return null;
        }
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        const items = xml.querySelectorAll('item');
        const news = [];
        
        items.forEach(function(item) {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const category = item.querySelector('category')?.textContent || '';
            
            const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
            
            if (title) {
                news.push({
                    title: title.trim(),
                    description: cleanDescription.substring(0, 300) || 'Описание отсутствует',
                    url: link || '#',
                    date: pubDate ? new Date(pubDate).toLocaleString() : new Date().toLocaleString(),
                    category: category || 'Новости'
                });
            }
        });
        
        return news;
    } catch (error) {
        console.error('Ошибка парсинга RSS:', error);
        return null;
    }
}

// ========== ЗАГРУЗКА НОВОСТЕЙ ИЗ ВСЕХ RSS ИСТОЧНИКОВ ==========
async function fetchAllNewsFromRSS() {
    console.log('📰 Загрузка новостей из RSS...');
    const allNews = [];
    
    try {
        const sources = [
            'https://www.kinopoisk.ru/news/rss/',
            'https://www.film.ru/rss/news',
            'https://www.ign.com/rss/articles',
            'https://www.litres.ru/static/rss/news.xml',
            'https://www.rbc.ru/rss/culture/',
            'https://www.kommersant.ru/RSS/news-culture.xml'
        ];
        
        const promises = sources.map(function(source) {
            return fetchRSSFeed(source);
        });
        
        const results = await Promise.all(promises);
        
        results.forEach(function(newsList) {
            if (newsList && newsList.length > 0) {
                allNews.push.apply(allNews, newsList);
            }
        });
        
        // Удаляем дубликаты
        const uniqueNews = [];
        const titles = {};
        
        allNews.forEach(function(news) {
            if (!titles[news.title]) {
                titles[news.title] = true;
                uniqueNews.push(news);
            }
        });
        
        // Сортируем по дате
        uniqueNews.sort(function(a, b) {
            var dateA = new Date(a.date);
            var dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        console.log('✅ Загружено новостей из RSS:', uniqueNews.length);
        return uniqueNews.slice(0, 50); // Берём только 50 последних
    } catch (error) {
        console.error('Ошибка загрузки RSS новостей:', error);
        return [];
    }
}

// ========== ПОЛУЧЕНИЕ НОВОСТЕЙ ПО КАТЕГОРИЯМ (из RSS) ==========
async function getMovieNews() {
    const allNews = await fetchAllNewsFromRSS();
    return allNews.filter(function(news) {
        return news.category === 'Фильмы' || 
               news.category === 'Кино' || 
               news.title.toLowerCase().includes('фильм') ||
               news.title.toLowerCase().includes('кино') ||
               news.title.toLowerCase().includes('премьер');
    });
}

async function getGameNews() {
    const allNews = await fetchAllNewsFromRSS();
    return allNews.filter(function(news) {
        return news.category === 'Игры' || 
               news.title.toLowerCase().includes('игр') ||
               news.title.toLowerCase().includes('гейм') ||
               news.title.toLowerCase().includes('dota') ||
               news.title.toLowerCase().includes('steam');
    });
}

async function getBookNews() {
    const allNews = await fetchAllNewsFromRSS();
    return allNews.filter(function(news) {
        return news.category === 'Книги' || 
               news.title.toLowerCase().includes('книг') ||
               news.title.toLowerCase().includes('литератур');
    });
}

async function fetchAllNews() {
    console.log('📰 Загрузка всех новостей...');
    return await fetchAllNewsFromRSS();
}

// ========== API КИНОПОИСКА ==========
async function searchKinopoiskAPI(query) {
    if (!query || query.trim() === '') return [];

    console.log('🔍 Поиск на Кинопоиске:', query);
    
    let allFilms = [];
    let totalPages = 0;

    try {
        const firstUrl = KINOPOISK_API_URL + 
            '/v2.1/films/search-by-keyword?keyword=' + 
            encodeURIComponent(query) + 
            '&page=1';

        const firstResponse = await fetch(firstUrl, {
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

        const firstData = await firstResponse.json();
        
        if (!firstData.films || firstData.films.length === 0) {
            console.log('❌ Ничего не найдено');
            return [];
        }

        totalPages = firstData.totalPages || 1;
        
        console.log('📊 Всего найдено:', firstData.total || firstData.films.length, 'фильмов, страниц:', totalPages);

        const firstPageFilms = firstData.films.map(function(film) {
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

        const pagesToLoad = Math.min(totalPages, MAX_PAGES);

        for (let page = 2; page <= pagesToLoad; page++) {
            console.log('📄 Загрузка страницы', page, 'из', pagesToLoad);

            const url = KINOPOISK_API_URL + 
                '/v2.1/films/search-by-keyword?keyword=' + 
                encodeURIComponent(query) + 
                '&page=' + page;

            const response = await fetch(url, {
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

            const data = await response.json();

            if (!data.films || data.films.length === 0) {
                break;
            }

            const pageFilms = data.films.map(function(film) {
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

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log('✅ Загружено фильмов:', allFilms.length);
        return allFilms;

    } catch (error) {
        console.error('Ошибка API Кинопоиска:', error);
        return [];
    }
}

// ========== ФУНКЦИЯ ПОЛУЧЕНИЯ ДЕТАЛЬНОЙ ИНФОРМАЦИИ ==========
async function getFilmDetails(filmId) {
    try {
        const url = KINOPOISK_API_URL + '/v2.2/films/' + filmId;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Ошибка получения деталей:', response.status);
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        return null;
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
        const url = 'https://api.igdb.com/v4/games';
        const searchQuery = 'search "' + query + '"; fields name,summary,first_release_date,cover.url,genres.name,platforms.name,rating,total_rating,involved_companies.company.name; limit 10;';
        
        const response = await fetch(url, {
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
        
        const data = await response.json();
        
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

// ========== API ДЛЯ КНИГ (Google Books) ==========
async function searchGoogleBooks(query) {
    if (!query || query.trim() === '') return [];
    
    try {
        var apiUrl = 'https://www.googleapis.com/books/v1/volumes?q=' + encodeURIComponent(query) + '&maxResults=10';
        if (GOOGLE_BOOKS_API_KEY) {
            apiUrl += '&key=' + GOOGLE_BOOKS_API_KEY;
        }
        
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        
        if (!response.ok) {
            console.error('Google Books API ошибка:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
            return data.items.map(function(book) {
                var volume = book.volumeInfo || {};
                var description = volume.description ? volume.description.replace(/<[^>]*>/g, '') : 'Описание отсутствует';
                var imageUrl = volume.imageLinks && volume.imageLinks.thumbnail ? volume.imageLinks.thumbnail : 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
                var authors = volume.authors ? volume.authors.join(', ') : 'Автор не указан';
                var publishedYear = volume.publishedDate ? volume.publishedDate.split('-')[0] : null;
                var rating = volume.averageRating ? volume.averageRating.toFixed(1) : null;
                
                return {
                    id: 'book_' + book.id,
                    type: "book",
                    title: volume.title || 'Без названия',
                    year: publishedYear,
                    rating: rating,
                    description: description.substring(0, 300),
                    image: imageUrl,
                    author: authors,
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
async function searchAllAPIs(query) {
    console.log('🔍 Универсальный поиск по запросу:', query);
    
    try {
        const [movies, games, books] = await Promise.all([
            searchKinopoiskAPI(query),
            searchIGDB(query),
            searchGoogleBooks(query)
        ]);
        
        var allResults = movies.concat(games).concat(books);
        
        console.log('📊 Результаты: фильмы/сериалы - ' + movies.length + 
                   ', игры - ' + games.length + 
                   ', книги - ' + books.length +
                   ', всего - ' + allResults.length);
        
        return allResults;
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        return [];
    }
}

// ========== ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ НОВОСТЕЙ ==========
async function updateNewsDatabase() {
    console.log('🔄 Обновление новостей...');
    
    try {
        const news = await fetchAllNews();
        
        if (news && news.length > 0) {
            localStorage.setItem('seeker_news', JSON.stringify(news));
            console.log('✅ Новости обновлены, добавлено:', news.length);
            return news;
        }
        return [];
    } catch (error) {
        console.error('Ошибка обновления новостей:', error);
        return [];
    }
}

// ========== ПОЛУЧЕНИЕ ПОПУЛЯРНЫХ ФИЛЬМОВ ==========
async function getPopularFilms(page) {
    page = page || 1;
    try {
        const url = KINOPOISK_API_URL + 
            '/v2.2/films/top?type=TOP_100_POPULAR&page=' + page;
        
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
            return data.films.map(function(film) {
                return {
                    id: 'kp_' + film.filmId,
                    type: film.type === "TV_SERIES" ? "series" : "movie",
                    title: film.nameRu || film.nameEn || 'Без названия',
                    year: film.year,
                    rating: film.rating,
                    description: film.description || "Описание отсутствует",
                    image: film.posterUrl || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                    director: "—",
                    cast: "—",
                    duration: "—",
                    source: "Кинопоиск",
                    links: { watch: "https://www.kinopoisk.ru/film/" + film.filmId + "/" }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Ошибка получения популярных фильмов:', error);
        return [];
    }
}

// ========== ЭКСПОРТ ФУНКЦИЙ ==========
window.searchKinopoiskAPI = searchKinopoiskAPI;
window.getFilmDetails = getFilmDetails;
window.searchIGDB = searchIGDB;
window.searchGoogleBooks = searchGoogleBooks;
window.searchAllAPIs = searchAllAPIs;
window.fetchAllNews = fetchAllNews;
window.updateNewsDatabase = updateNewsDatabase;
window.getMovieNews = getMovieNews;
window.getGameNews = getGameNews;
window.getBookNews = getBookNews;
window.getPopularFilms = getPopularFilms;
window.fetchAllNewsFromRSS = fetchAllNewsFromRSS;

console.log('✅ API модуль загружен');
console.log('📌 Кинопоиск API: ✅ настроен');
console.log('📌 IGDB API: ' + (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN ? '✅ настроен' : '❌ не настроен'));
console.log('📌 Google Books API: ✅ работает без ключа');
console.log('📌 NewsAPI: ❌ ОТКЛЮЧЕН (SSL ошибка)');
console.log('📌 RSS новости: ✅ загружены');
console.log('📌 Максимальное количество страниц для поиска:', MAX_PAGES);
