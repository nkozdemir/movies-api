import { IncomingMessage, ServerResponse } from 'http';
import { movieController } from '../../controllers/movieController';
import * as movieService from '../../services/movieService';
import * as directorService from '../../services/directorService';
import { Socket } from 'net';
import { EventEmitter } from 'events';

// Mock services
jest.mock('../../services/movieService');
jest.mock('../../services/directorService');

class MockIncomingMessage extends IncomingMessage {
    constructor() {
        const socket = new Socket();
        super(socket);
        this.method = 'POST';
        this.headers = { 'content-type': 'application/json' };
    }

    // Helper method to simulate request data
    async simulateRequest(data: any): Promise<void> {
        return new Promise<void>((resolve) => {
            process.nextTick(() => {
                this.emit('data', JSON.stringify(data));
                process.nextTick(() => {
                    this.emit('end');
                    resolve();
                });
            });
        });
    }
}

describe('Movie Controller Unit Tests', () => {
    let mockRequest: MockIncomingMessage;
    let mockResponse: Partial<ServerResponse>;
    let responseData: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock response
        mockResponse = {
            writeHead: jest.fn(),
            end: jest.fn().mockImplementation((data) => {
                responseData = JSON.parse(data);
            })
        };

        // Reset response data
        responseData = null;
    });

    describe('getAllMovies', () => {
        it('should return movies successfully', async () => {
            const mockMovies = [
                { title: 'Movie 1', director: { firstName: 'Director 1' } }
            ];
            
            (movieService.getAllMovies as jest.Mock).mockResolvedValue(mockMovies);

            await movieController.getAllMovies(new MockIncomingMessage(), mockResponse as ServerResponse);

            expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
            expect(responseData).toEqual({
                status: 200,
                success: true,
                message: 'Movies retrieved successfully',
                data: mockMovies
            });
        });

        it('should handle errors', async () => {
            (movieService.getAllMovies as jest.Mock).mockRejectedValue(new Error('Database error'));

            await movieController.getAllMovies(new MockIncomingMessage(), mockResponse as ServerResponse);

            expect(mockResponse.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'application/json' });
            expect(responseData).toEqual({
                status: 500,
                success: false,
                message: 'Internal Server Error',
                error: 'Failed to fetch movies from the database'
            });
        });
    });

    describe('createMovie', () => {
        beforeEach(() => {
            mockRequest = new MockIncomingMessage();
        });

        it('should create movie successfully', async () => {
            const movieData = {
                title: 'Test Movie',
                description: 'Test Description',
                releaseDate: '2024-01-01',
                genre: 'Test',
                rating: 8.5,
                imdbId: 'tt1234567',
                director: 'director-id'
            };

            (directorService.getDirectorById as jest.Mock).mockResolvedValue({ _id: 'director-id' });
            (movieService.createMovie as jest.Mock).mockResolvedValue({ ...movieData, _id: 'movie-id' });

            const promise = movieController.createMovie(mockRequest, mockResponse as ServerResponse);
            await mockRequest.simulateRequest(movieData);
            await promise;

            expect(mockResponse.writeHead).toHaveBeenCalledWith(201, { 'Content-Type': 'application/json' });
            expect(responseData).toEqual({
                status: 201,
                success: true,
                message: 'Movie created successfully',
                data: expect.objectContaining(movieData)
            });
        });

        it('should validate required fields', async () => {
            const invalidData = {
                title: 'Test Movie'
                // Missing required fields
            };

            const promise = movieController.createMovie(mockRequest, mockResponse as ServerResponse);
            await mockRequest.simulateRequest(invalidData);
            await promise;

            expect(mockResponse.writeHead).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            expect(responseData.success).toBe(false);
            expect(responseData.message).toBe('Validation Error');
        });

        it('should validate rating range', async () => {
            const invalidData = {
                ...createValidMovieData(),
                rating: 11
            };

            const promise = movieController.createMovie(mockRequest, mockResponse as ServerResponse);
            await mockRequest.simulateRequest(invalidData);
            await promise;

            expect(responseData.success).toBe(false);
            expect(responseData.error).toContain('Rating must be between 0 and 10');
        });

        it('should handle non-existent director', async () => {
            const movieData = createValidMovieData();
            (directorService.getDirectorById as jest.Mock).mockResolvedValue(null);

            const promise = movieController.createMovie(mockRequest, mockResponse as ServerResponse);
            await mockRequest.simulateRequest(movieData);
            await promise;

            expect(responseData.success).toBe(false);
            expect(responseData.error).toBe('Director not found');
            expect(responseData.status).toBe(404);
        });
    });

    describe('updateMovie', () => {
        beforeEach(() => {
            mockRequest = new MockIncomingMessage();
            mockRequest.url = '/movies/movie-id';
        });

        it('should update movie successfully', async () => {
            const updateData = {
                title: 'Updated Title',
                rating: 9.0
            };

            (movieService.updateMovie as jest.Mock).mockResolvedValue({
                ...createValidMovieData(),
                ...updateData
            });

            const promise = movieController.updateMovie(mockRequest, mockResponse as ServerResponse);
            await mockRequest.simulateRequest(updateData);
            await promise;

            expect(responseData.success).toBe(true);
            expect(responseData.data.title).toBe(updateData.title);
            expect(responseData.data.rating).toBe(updateData.rating);
        });

        it('should validate update data', async () => {
            const invalidData = {
                rating: 11,
                imdbId: 'invalid'
            };

            const promise = movieController.updateMovie(mockRequest, mockResponse as ServerResponse);
            await mockRequest.simulateRequest(invalidData);
            await promise;

            expect(responseData.success).toBe(false);
            expect(responseData.message).toBe('Validation Error');
            expect(responseData.error).toContain('Rating must be between 0 and 10');
        });
    });

    describe('deleteMovie', () => {
        beforeEach(() => {
            mockRequest = new MockIncomingMessage();
            mockRequest.url = '/movies/movie-id';
        });

        it('should delete movie successfully', async () => {
            (movieService.deleteMovie as jest.Mock).mockResolvedValue({ _id: 'movie-id' });

            await movieController.deleteMovie(mockRequest, mockResponse as ServerResponse);

            expect(responseData.success).toBe(true);
            expect(responseData.message).toBe('Movie deleted successfully');
        });

        it('should handle non-existent movie', async () => {
            (movieService.deleteMovie as jest.Mock).mockResolvedValue(null);

            await movieController.deleteMovie(mockRequest, mockResponse as ServerResponse);

            expect(responseData.success).toBe(false);
            expect(responseData.status).toBe(404);
            expect(responseData.error).toBe('Movie not found');
        });
    });
});

function createValidMovieData() {
    return {
        title: 'Test Movie',
        description: 'Test Description',
        releaseDate: '2024-01-01',
        genre: 'Test',
        rating: 8.5,
        imdbId: 'tt1234567',
        director: 'director-id'
    };
} 