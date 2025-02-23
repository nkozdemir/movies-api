import request from 'supertest';
import { createServer } from 'http';
import { Movie } from '../../models/movie';
import { Director } from '../../models/director';
import mongoose from 'mongoose';

const app = createServer(async (req, res) => {
    const { movieRoutes } = await import('../../routes/movies');
    
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    
    if (req.method === 'GET' && url.pathname === '/movies') {
        await movieRoutes.getAllMovies(req, res);
    } else if (req.method === 'POST' && url.pathname === '/movies') {
        await movieRoutes.createMovie(req, res);
    } else if (req.method === 'PUT' && url.pathname.startsWith('/movies/')) {
        await movieRoutes.updateMovie(req, res);
    } else if (req.method === 'DELETE' && url.pathname.startsWith('/movies/')) {
        await movieRoutes.deleteMovie(req, res);
    }
});

describe('Movie Endpoints', () => {
    let testDirectorId: string;

    beforeEach(async () => {
        await Movie.deleteMany({});
        await Director.deleteMany({});

        // Create a test director
        const director = await Director.create({
            firstName: 'Test',
            lastName: 'Director',
            birthDate: new Date('1970-01-01'),
            bio: 'Test bio'
        }) as any;
        testDirectorId = director._id.toString();
    });

    describe('GET /movies', () => {
        it('should return empty array when no movies exist', async () => {
            const res = await request(app).get('/movies');
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });

        it('should return all movies', async () => {
            const testMovie = await Movie.create({
                title: 'Test Movie',
                description: 'Test Description',
                releaseDate: new Date('2024-01-01'),
                genre: 'Test Genre',
                rating: 8.5,
                imdbId: 'tt1234567',
                director: testDirectorId
            });

            const res = await request(app).get('/movies');
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data[0].title).toBe(testMovie.title);
        });
    });

    describe('POST /movies', () => {
        it('should create a new movie with valid data', async () => {
            const movieData = {
                title: 'Test Movie',
                description: 'Test Description',
                releaseDate: '2024-01-01',
                genre: 'Test Genre',
                rating: 8.5,
                imdbId: 'tt1234567',
                director: testDirectorId
            };

            const res = await request(app)
                .post('/movies')
                .send(movieData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(movieData.title);
        });

        it('should return validation error for invalid data', async () => {
            const invalidMovieData = {
                title: '',  // Invalid: empty title
                rating: 11  // Invalid: rating > 10
            };

            const res = await request(app)
                .post('/movies')
                .send(invalidMovieData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Validation Error');
        });
    });

    describe('PUT /movies/:id', () => {
        it('should update movie with valid data', async () => {
            const movie = await Movie.create({
                title: 'Original Title',
                description: 'Original Description',
                releaseDate: new Date('2024-01-01'),
                genre: 'Original Genre',
                rating: 8.5,
                imdbId: 'tt1234567',
                director: testDirectorId
            });

            const updateData = {
                title: 'Updated Title',
                rating: 9.0
            };

            const res = await request(app)
                .put(`/movies/${movie._id}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(updateData.title);
            expect(res.body.data.rating).toBe(updateData.rating);
        });

        it('should return 404 for non-existent movie', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/movies/${nonExistentId}`)
                .send({ title: 'Updated Title' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /movies/:id', () => {
        it('should delete existing movie', async () => {
            const movie = await Movie.create({
                title: 'Test Movie',
                description: 'Test Description',
                releaseDate: new Date('2024-01-01'),
                genre: 'Test Genre',
                rating: 8.5,
                imdbId: 'tt1234567',
                director: testDirectorId
            });

            const res = await request(app)
                .delete(`/movies/${movie._id}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            
            const deletedMovie = await Movie.findById(movie._id);
            expect(deletedMovie).toBeNull();
        });

        it('should return 404 for non-existent movie', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/movies/${nonExistentId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
}); 