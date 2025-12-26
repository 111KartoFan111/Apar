Apar Intelligent Transportation System
======================================

О проекте
Проект для управления автопарком и операциями перевозок: мониторинг состояния техники, учет расходов, обслуживание, складские операции, отчетность.

Основные характеристики
- Панель автопарка: статусы, расходы, пробеги, здоровье, топливо, напоминания по ТО.
- Финансовая аналитика: топливо, ремонты, запчасти, штрафы; импорт/экспорт CSV.
- Операционные процессы: путевые листы, осмотры с вложениями, регламенты ТО, наряды.
- Склады и запчасти: стационарные/мобильные склады, перемещения, заказы, CSV.
- Шины и штрафы: учет, назначения, износ/остаток, алерты.
- Отчеты с шаблонами и выгрузкой в CSV.
- ИИ-помощники: шаблоны отчетов, нормализация маршрутов, советы по ТО.
- Аутентификация JWT, сиды с админом по умолчанию.
- Локализация интерфейса RU/KZ.

Технологический стек
- Frontend: React 18, TypeScript, Vite, React Router, TanStack Query, TailwindCSS, i18next.
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT.
- БД: PostgreSQL (тесты на SQLite).
- Инфраструктура: Docker, docker-compose, .env конфигурация.

Быстрый старт
1. Проверьте настройки в `.env` (база данных, JWT, порты).
2. Запустите сервисы:
   ```
   docker-compose up --build
   ```
3. Откройте backend: http://localhost:7080
4. Откройте frontend: http://localhost:4173
5. Демо-доступ (если `SEED_DEMO=true`): логин `Damir`, пароль `damird4321`.

Локальная разработка
Backend:
```
cd backend
uvicorn app.main:app --reload
```

Frontend:
```
cd frontend
npm install
npm run dev
```

Для фронта укажите `VITE_API_URL`, если backend на другом хосте/порту.

ИИ и ассистенты
- Эндпойнты: `/ai/report-builder`, `/ai/waybill-normalize`, `/ai/maintenance-advice` (требуют JWT).
- Без `GEMINI_API_KEY` возвращаются детерминированные мок-ответы.
- С ключом ответы помечаются `llm=gemini` (интеграция подготовлена, вызов провайдера нужно подключить).

Переменные окружения (основные)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PORT` или единый `DATABASE_URL`.
- `BACKEND_PORT`, `FRONTEND_PORT` для портов Docker.
- `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`.
- `GEMINI_API_KEY` для ИИ-модулей.
- `SEED_DEMO` для включения/отключения демо-данных.

Миграции
- SQL-файлы в `backend/db/migrations/*.sql`.
- Применяются при старте backend; список фиксируется в `schema_migrations`.

Тестирование
- Backend тесты: `pytest` (SQLite), тестовые креды `admin/admin123`.

Структура репозитория
- `backend/` сервер, миграции, сиды, тесты.
- `frontend/` клиентское приложение.
- `tests/` тесты backend.
- `docker-compose.yml` сервисы базы данных, backend, frontend.
