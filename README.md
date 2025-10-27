# News Aggregator API

A TypeScript-based RESTful API for aggregating news based on user preferences.

## Features

- User authentication (signup and login)
- User preferences management
- News aggregation based on preferences
- JWT-based authentication
- MongoDB for data persistence

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## Prerequisites

- Node.js >= 18.0.0
- MongoDB installed and running locally on port 27017

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Development

Run the development server with hot-reload:
```bash
npm run dev
```

## Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

The compiled JavaScript files will be in the `dist` directory.

## Run

Run the production server:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Endpoints

### Authentication

- `POST /users/signup` - Create a new user account
- `POST /users/login` - Login with email and password

### User Preferences

- `GET /users/preferences` - Get user preferences (requires authentication)
- `PUT /users/preferences` - Update user preferences (requires authentication)

### News

- `GET /news` - Get news based on user preferences (requires authentication)

## Project Structure

```
├── app.ts                 # Main application file
├── dist/                  # Compiled JavaScript files
├── types/                 # TypeScript type definitions
├── models/                # Mongoose models
├── controllers/           # Route controllers
├── services/              # Business logic
├── router/                # Express routes
└── test/                  # Test files
```

## License

ISC

## Author

Airtribe

