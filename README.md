# Movies API

A RESTful API for managing movies and directors built with Node.js, TypeScript, MongoDB, and Redis.

## Features

- RESTful endpoints for movies and directors
- MongoDB for data persistence
- Redis for caching
- TypeScript for type safety
- Docker support for easy deployment
- Input validation and error handling
- Data caching for improved performance

## Prerequisites

- Node.js
- MongoDB
- Redis
- Docker and Docker Compose (optional)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movies-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/moviesDB
REDIS_HOST=localhost
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript files:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

### Using Docker

```bash
docker-compose up
```

## Database Seeding

The application comes with a seeding script that populates the database with sample movies and directors.

### Local Development

```bash
npm run seed
```

### Using Docker

```bash
# If the containers are running
docker-compose exec app npm run seed

# Or in a single command with container startup
docker-compose up -d && docker-compose exec app npm run seed
```

The seed script will:
- Clear any existing data in the database
- Create sample directors (Christopher Nolan, Martin Scorsese, Quentin Tarantino)
- Create sample movies (Inception, The Wolf of Wall Street, Pulp Fiction, The Dark Knight)
- Link movies with their respective directors

## API Endpoints

### Movies

- `GET /movies` - Get all movies
- `POST /movies` - Create a new movie
- `PUT /movies/:id` - Update a movie
- `DELETE /movies/:id` - Delete a movie

### Directors

- `POST /directors` - Create a new director
- `DELETE /directors/:id` - Delete a director

## Request/Response Examples

### Create a Movie

```json
POST /movies
{
  "title": "Inception",
  "description": "A thief who steals corporate secrets through dream-sharing technology",
  "releaseDate": "2010-07-16",
  "genre": "Sci-Fi",
  "rating": 8.8,
  "imdbId": "tt1375666",
  "director": "director_id_here"
}
```

### Create a Director

```json
POST /directors
{
  "firstName": "Christopher",
  "lastName": "Nolan",
  "birthDate": "1970-07-30",
  "bio": "British-American film director known for mind-bending narratives"
}
```

## Project Structure

```
movies-api/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── redis.ts
│   ├── controllers/
│   │   ├── movieController.ts
│   │   └── directorController.ts
│   ├── models/
│   │   ├── movie.ts
│   │   └── director.ts
│   ├── routes/
│   │   ├── movies.ts
│   │   └── directors.ts
│   ├── services/
│   │   ├── movieService.ts
│   │   └── directorService.ts
│   └── server.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the TypeScript files
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Technologies Used

- Node.js
- TypeScript
- MongoDB with Mongoose
- Redis
- Docker
- Jest (Testing)
- ESLint (Linting)
- Prettier (Code Formatting)
