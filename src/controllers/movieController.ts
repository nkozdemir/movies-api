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

                // Check if any data was provided
                if (Object.keys(movieData).length === 0) {
                    return sendError(res, 'No update data provided', 'Validation Error', 400);
                }

                const updateFields: Record<string, any> = {};
                const validationErrors: string[] = [];

                // Validate only the fields that were provided
                if (movieData.releaseDate !== undefined) {
                    const releaseDate = new Date(movieData.releaseDate);
                    if (isNaN(releaseDate.getTime())) {
                        validationErrors.push('Invalid release date format. Use YYYY-MM-DD format');
                    } else {
                        updateFields.releaseDate = releaseDate;
                    }
                }

                if (movieData.rating !== undefined) {
                    if (typeof movieData.rating !== 'number' || movieData.rating < 0 || movieData.rating > 10) {
                        validationErrors.push('Rating must be a number between 0 and 10');
                    } else {
                        updateFields.rating = movieData.rating;
                    }
                }

                if (movieData.imdbId !== undefined) {
                    if (!/^tt\d{7}$/.test(movieData.imdbId)) {
                        validationErrors.push('Invalid IMDb ID format. Use ttXXXXXXX format (e.g., tt0468569)');
                    } else {
                        updateFields.imdbId = movieData.imdbId;
                    }
                }

                if (movieData.director !== undefined) {
                    const existingDirector = await getDirectorById(movieData.director);
                    if (!existingDirector) {
                        validationErrors.push('Director not found');
                    } else {
                        updateFields.director = movieData.director;
                    }
                }

                // Handle string fields with simple validation
                const stringFields = ['title', 'description', 'genre'];
                stringFields.forEach(field => {
                    if (movieData[field] !== undefined) {
                        if (typeof movieData[field] !== 'string' || !movieData[field].trim()) {
                            validationErrors.push(`${field} must be a non-empty string`);
                        } else {
                            updateFields[field] = movieData[field].trim();
                        }
                    }
                });

                // If there are any validation errors, return them all at once
                if (validationErrors.length > 0) {
                    return sendError(res, validationErrors, 'Validation Error', 400);
                }

                const updatedMovie = await updateMovie(movieId, updateFields);
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
