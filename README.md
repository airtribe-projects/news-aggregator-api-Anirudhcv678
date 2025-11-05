# News Aggregator API

A REST API that aggregates news from multiple sources based on user preferences. Built with TypeScript, Express, and MongoDB.

## Quick Start

```bash
npm install
npm run dev    # Development mode
npm start      # Production mode
```

**Requirements:** Node.js >= 18, MongoDB running on port 27017

## Folder Structure

```
src/
├── app.ts                          # Main application entry
├── modules/
│   ├── user/                       # User module
│   │   ├── presentation/          # Controllers & routes
│   │   └── infrastructure/        # Models & repositories
│   └── news/                      # News module
│       ├── presentation/          # Controllers & routes
│       └── infrastructure/        # Services (API clients, cache)
├── middleware/                     # Authentication middleware
├── utils/                         # Utilities (validators, responses)
└── test/                          # Test files
```

## API Endpoints

### Authentication
- `POST /users/signup` - Create account (optional: include preferences)
- `POST /users/login` - Login (returns JWT token)

### User Preferences
- `GET /users/preferences` - Get user preferences (auth required)
- `PUT /users/preferences` - Update preferences (auth required)

### News
- `GET /news` - Get personalized news (auth required)
- `GET /news/search/:keyword` - Search articles (auth required)
- `POST /news/:id/read` - Mark article as read (auth required)
- `POST /news/:id/favorite` - Mark article as favorite (auth required)
- `GET /news/read` - Get all read articles (auth required)
- `GET /news/favorites` - Get all favorite articles (auth required)

**Note:** Use `Authorization: Bearer <token>` header for protected endpoints.

## Features

- **Caching:** 15-minute cache for news articles
- **Background Updates:** Automatic cache refresh every 15 minutes
- **Multiple Sources:** Aggregates from 4 news APIs (NewsAPI.org, NewsCatcher, GNews, NewsAPI.ai)
- **User Management:** Read/favorite tracking, preference-based filtering

## Testing

```bash
npm test
```
