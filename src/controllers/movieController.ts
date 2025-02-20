import { IncomingMessage, ServerResponse } from 'http';
import { getAllMovies, createMovie, updateMovie, deleteMovie } from '../services/movieService';
import { parse } from 'url';

export const movieController = {
    getAllMovies: async (_req: IncomingMessage, res: ServerResponse) => {
        try {
            const movies = await getAllMovies();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(movies));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error fetching movies' }));
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
                const newMovie = await createMovie(movieData);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newMovie));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid movie data' }));
            }
        });
    },

    updateMovie: async (req: IncomingMessage, res: ServerResponse) => {
        const parsedUrl = parse(req.url || '', true);
        const movieId = parsedUrl.pathname?.split('/')[2];

        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const movieData = JSON.parse(body);
                const updatedMovie = await updateMovie(movieId as string, movieData);
                if (!updatedMovie) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Movie not found' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedMovie));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error updating movie' }));
            }
        });
    },

    deleteMovie: async (req: IncomingMessage, res: ServerResponse) => {
        const parsedUrl = parse(req.url || '', true);
        const movieId = parsedUrl.pathname?.split('/')[2];

        try {
            const deletedMovie = await deleteMovie(movieId as string);
            if (!deletedMovie) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Movie not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Movie deleted successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error deleting movie' }));
        }
    }
};
