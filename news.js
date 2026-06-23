// Загрузка новостей из localStorage для синхронизации с админ-панелью
let newsDatabase = JSON.parse(localStorage.getItem('admin_news_database')) || [
    { id: 1, category: "Игры", title: "Valorant: вышел патч 8.11 с новым агентом", description: "Riot Games представила сбалансированные изменения и свежего стража. Новый агент получил способности, связанные с временным контролем.", date: "2 часа назад", url: "https://playvalorant.com/ru-ru/news/" },
    { id: 2, category: "Игры", title: "The International 2024: рекордный призовой фонд", description: "Турнир по Dota 2 соберет лучшие команды мира в Копенгагене. Призовой фонд превысил 3 миллиона долларов.", date: "Вчера", url: "https://www.dota2.com/esports/ti13/" },
    { id: 3, category: "Сериалы", title: "Новый сериал по Гарри Поттеру: первые детали", description: "HBO раскрыл планы на 7 сезонов с новым актерским составом. Создатели обещают максимальную близость к книгам.", date: "5 часов назад", url: "https://www.hbo.com/harry-potter" },
    { id: 4, category: "Фильмы", title: "Дьявол носит Prada 2 официально анонсирован", description: "Мерил Стрип и Энн Хэтэуэй могут вернуться к своим ролям. Съемки начнутся в 2025 году.", date: "2 дня назад", url: "https://www.kinopoisk.ru/film/devil-wears-prada-2/" },
    { id: 5, category: "Книги", title: "Новая книга о Гарри Поттере выйдет в 2025", description: "Джоан Роулинг работает над расширением магической вселенной. Детали пока держатся в секрете.", date: "4 дня назад", url: "https://www.bloomsbury.com/uk/discover/harry-potter/" },
    { id: 6, category: "Игры", title: "CD Projekt RED анонсировала новую игру во вселенной Ведьмака", description: "Студия подтвердила разработку следующей части саги на Unreal Engine 5. Проект находится на ранней стадии.", date: "3 дня назад", url: "https://www.thewitcher.com/ru/" }
];

// Сохраняем в localStorage для синхронизации с админ-панелью
if (!localStorage.getItem('admin_news_database')) {
    localStorage.setItem('admin_news_database', JSON.stringify(newsDatabase));
}

window.newsDatabase = newsDatabase;