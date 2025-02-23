import request from 'supertest';
import { createServer } from 'http';
import { Movie } from '../../models/movie';
import { Director } from '../../models/director';
import mongoose from 'mongoose';

const app = createServer(async (req, res) => {
    const { directorRoutes } = await import('../../routes/directors');
    
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    
    if (req.method === 'POST' && url.pathname === '/directors') {
        await directorRoutes.createDirector(req, res);
    } else if (req.method === 'DELETE' && url.pathname.startsWith('/directors/')) {
        await directorRoutes.deleteDirector(req, res);
    }
});

describe('Director Endpoints', () => {
    beforeEach(async () => {
        await Director.deleteMany({});
        await Movie.deleteMany({});
    });

    describe('POST /directors', () => {
        it('should create a new director with valid data', async () => {
            const directorData = {
                firstName: 'Christopher',
                lastName: 'Nolan',
                birthDate: '1970-07-30',
                bio: 'Test bio'
            };

            const res = await request(app)
                .post('/directors')
                .send(directorData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.firstName).toBe(directorData.firstName);
            expect(res.body.data.lastName).toBe(directorData.lastName);
        });

        it('should return validation error for invalid data', async () => {
            const invalidDirectorData = {
                firstName: '',  // Invalid: empty firstName
                lastName: 'Nolan'
                // Missing required fields: birthDate, bio
            };

            const res = await request(app)
                .post('/directors')
                .send(invalidDirectorData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Validation Error');
        });

        it('should validate birth date format', async () => {
            const invalidDateData = {
                firstName: 'Christopher',
                lastName: 'Nolan',
                birthDate: 'invalid-date',
                bio: 'Test bio'
            };

            const res = await request(app)
                .post('/directors')
                .send(invalidDateData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Invalid birth date format');
        });
    });

    describe('DELETE /directors/:id', () => {
        it('should delete director with no movies', async () => {
            const director = await Director.create({
                firstName: 'Test',
                lastName: 'Director',
                birthDate: new Date('1970-01-01'),
                bio: 'Test bio'
            });

            const res = await request(app)
                .delete(`/directors/${director._id}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            
            const deletedDirector = await Director.findById(director._id);
            expect(deletedDirector).toBeNull();
        });

        it('should not delete director with associated movies', async () => {
            const director = await Director.create({
                firstName: 'Test',
                lastName: 'Director',
                birthDate: new Date('1970-01-01'),
                bio: 'Test bio'
            });

            // Create a movie associated with the director
            await Movie.create({
                title: 'Test Movie',
                description: 'Test Description',
                releaseDate: new Date('2024-01-01'),
                genre: 'Test Genre',
                rating: 8.5,
                imdbId: 'tt1234567',
                director: director._id
            });

            const res = await request(app)
                .delete(`/directors/${director._id}`);

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Cannot delete director because they have associated movies');
            
            const directorStillExists = await Director.findById(director._id);
            expect(directorStillExists).not.toBeNull();
        });

        it('should return 404 for non-existent director', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/directors/${nonExistentId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
}); 