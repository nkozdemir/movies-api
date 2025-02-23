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

## Database Seeding (Optional, for development and testing purposes)

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

Postman Collection: [Movies API](https://www.postman.com/nkozd/workspace/movies-api/collection/28299888-13d8c90a-f869-42a9-bd7f-0b15f422219f?action=share&creator=28299888)

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

## Architecture Overview

This project follows a layered architecture, which separates concerns into distinct components to enhance maintainability, scalability, and testability. The main components of the architecture are:

- **Controllers**: 
  - Responsible for handling incoming HTTP requests and sending responses. They act as intermediaries between the client and the service layer.
  - Each controller corresponds to a specific resource (e.g., movies, directors).

- **Services**: 
  - Contain the business logic of the application. They interact with the database and perform CRUD operations.
  - Services are reusable and can be called by multiple controllers.

- **Models**: 
  - Define the data schemas and manage interactions with the database using Mongoose.
  - Each model corresponds to a specific collection in the MongoDB database.

- **Utilities**: 
  - Helper functions that provide common functionalities, such as response formatting and error handling.

### Project Structure

```
src/
├── controllers/    # HTTP request handlers
├── models/         # Database schemas
├── services/       # Business logic
├── utils/          # Helper functions
└── tests/          # Unit tests
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

## Testing

The application includes comprehensive unit tests for all endpoints using Jest. The tests focus on controller-level functionality, ensuring proper request handling, validation, and response formatting.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Environment

- Uses mocked services for isolation
- Simulates HTTP requests and responses
- Validates response formatting and status codes
- Tests error handling and edge cases

### Current Coverage (Unit Tests)

- Overall Statement Coverage: 77.89%
- Branch Coverage: 80%
- Function Coverage: 69.56%
- Line Coverage: 76.53%

#### Coverage by Component
- **Controllers**: 95.79% coverage
  - `directorController.ts`: 94.44% statements, 90.9% branches
  - `movieController.ts`: 96.38% statements, 89.18% branches
- **Models**: 100% coverage
- **Utils**: 100% line coverage, 25% branch coverage

### Unit Test Cases

#### Movie Controller
- **GET /movies**
  - Returns all movies successfully
  - Handles database errors appropriately

- **POST /movies**
  - Creates movie with valid data
  - Validates required fields:
    - title
    - description
    - releaseDate
    - genre
    - rating
    - imdbId
    - director
  - Validates data formats:
    - Release date format
    - Rating range (0-10)
    - IMDb ID pattern
  - Handles non-existent director
  - Handles invalid JSON input

- **PUT /movies/:id**
  - Updates movie with valid data
  - Validates partial updates
  - Handles missing movie ID
  - Handles no fields provided for update
  - Validates field formats:
    - Empty string fields
    - Release date
    - Rating range
    - IMDb ID
  - Handles non-existent director
  - Handles non-existent movie
  - Handles invalid JSON

- **DELETE /movies/:id**
  - Deletes existing movie
  - Handles missing movie ID
  - Handles non-existent movie
  - Validates movie ID requirement

#### Director Controller
- **POST /directors**
  - Creates director with valid data
  - Validates required fields:
    - firstName
    - lastName
    - birthDate
    - bio
  - Validates birth date format
  - Handles invalid JSON input

- **DELETE /directors/:id**
  - Deletes director with no movies
  - Prevents deletion of director with movies
  - Handles non-existent director
  - Validates director ID requirement

### Mocking Strategy
- Services are mocked to isolate controller logic
- Request/Response objects are mocked to simulate HTTP interactions
- External dependencies (MongoDB, Redis) are not involved in unit tests
