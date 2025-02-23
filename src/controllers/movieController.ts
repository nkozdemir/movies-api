import { IncomingMessage, ServerResponse } from 'http';
import { getAllMovies, createMovie, updateMovie, deleteMovie } from '../services/movieService';
import { parse } from 'url';
import { sendSuccess, sendError } from '../utils/response';
import { getDirectorById } from '../services/directorService';

export const movieController = {
    getAllMovies: async (_req: IncomingMessage, res: ServerResponse) => {
        try {
            const movies = await getAllMovies();
            sendSuccess(res, movies, 'Movies retrieved successfully');
        } catch (error) {
            sendError(res, 'Failed to fetch movies from the database', 'Internal Server Error', 500);
        }
    },

    createMovie: async (req: IncomingMessage, res: ServerResponse) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const movieData = JSON.parse(body);
                
                // Validate required fields
                const requiredFields = ['title', 'description', 'releaseDate', 'genre', 'rating', 'imdbId', 'director'];
                const missingFields = requiredFields.filter(field => !movieData[field]);
                
                if (missingFields.length > 0) {
                    return sendError(
                        res, 
                        `Missing required fields: ${missingFields.join(', ')}`,
                        'Validation Error',
                        400
                    );
                }

                // Validate release date format
                const releaseDate = new Date(movieData.releaseDate);
                if (isNaN(releaseDate.getTime())) {
                    return sendError(
                        res,
                        'Invalid release date format. Use YYYY-MM-DD format',
                        'Validation Error',
                        400
                    );
                }

                // Validate rating range
                if (movieData.rating < 0 || movieData.rating > 10) {
                    return sendError(
                        res,
                        'Rating must be between 0 and 10',
                        'Validation Error',
                        400
                    );
                }

                // Validate imdbId field
                if (movieData.imdbId !== undefined && !/tt\d{7}/.test(movieData.imdbId)) {
                    return sendError(
                        res,
                        'Invalid IMDb ID format. Use ttXXXXXXXX format',
                        'Validation Error',
                        400
                    );
                }

                // Check if the director exists
                const existingDirector = await getDirectorById(movieData.director);
                if (!existingDirector) {
                    return sendError(res, 'Director not found', 'Not Found', 404);
                }

                const newMovie = await createMovie(movieData);
                sendSuccess(res, newMovie, 'Movie created successfully', 201);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    sendError(res, 'Invalid JSON format', 'Invalid Request', 400);
                } else {
                    sendError(res, 'Failed to create movie', 'Internal Server Error', 500);
                }
            }
        });
    },

    updateMovie: async (req: IncomingMessage, res: ServerResponse) => {
        const parsedUrl = parse(req.url || '', true);
        const movieId = parsedUrl.pathname?.split('/')[2];

        if (!movieId) {
            return sendError(res, 'Movie ID is required', 'Invalid Request', 400);
        }

        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const movieData = JSON.parse(body);
                if (Object.keys(movieData).length === 0) {
                    return sendError(res, 'No fields provided for update', 'Validation Error', 400);
                }

                let errors: string[] = [];

                // Validate title, description, genre. if provided, they cannot be empty
                const stringFields = ['title', 'description','genre'];
                
                for (const field of stringFields) {
                    if (movieData[field] !== undefined && movieData[field] === '') {
                        errors.push(`${field} cannot be empty`);
                    }
                }

                // Validate provided fields
                if (movieData.releaseDate !== undefined) {
                    const releaseDate = new Date(movieData.releaseDate);
                    if (isNaN(releaseDate.getTime())) {
                        errors.push('Invalid release date format. Use YYYY-MM-DD');
                    }
                }

                if (movieData.rating !== undefined && (movieData.rating < 0 || movieData.rating > 10)) {
                    errors.push('Rating must be between 0 and 10');
                }

                if (movieData.imdbId !== undefined && !/tt\d{7}/.test(movieData.imdbId)) {
                    errors.push('Invalid IMDb ID format. Use ttXXXXXXXX');
                }

                if (errors.length > 0) {
                    return sendError(res, errors.join(', '), 'Validation Error', 400);
                }

                if (movieData.director !== undefined) {
                    const existingDirector = await getDirectorById(movieData.director);
                    if (!existingDirector) {
                        return sendError(res, 'Director not found', 'Not Found', 404);
                    }
                }

                const updatedMovie = await updateMovie(movieId, movieData);
                if (!updatedMovie) {
                    return sendError(res, 'Movie not found', 'Not Found', 404);
                }
                
                sendSuccess(res, updatedMovie, 'Movie updated successfully');
            } catch (error) {
                if (error instanceof SyntaxError) {
                    sendError(res, 'Invalid JSON format', 'Invalid Request', 400);
                } else {
                    sendError(res, 'Failed to update movie', 'Internal Server Error', 500);
                }
            }
        });
    },

    deleteMovie: async (req: IncomingMessage, res: ServerResponse) => {
        const parsedUrl = parse(req.url || '', true);
        const movieId = parsedUrl.pathname?.split('/')[2];

        if (!movieId) {
            return sendError(res, 'Movie ID is required', 'Invalid Request', 400);
        }

        try {
            const deletedMovie = await deleteMovie(movieId);
            if (!deletedMovie) {
                return sendError(res, 'Movie not found', 'Not Found', 404);
            }
            
            sendSuccess(res, null, 'Movie deleted successfully');
        } catch (error) {
            sendError(res, 'Failed to delete movie', 'Internal Server Error', 500);
        }
    }
};
