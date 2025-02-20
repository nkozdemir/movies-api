import http from 'http';
import { connectDB } from './config/db';
import { movieRoutes } from './routes/movies';
import { directorRoutes } from './routes/directors';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import dotenv from 'dotenv';

dotenv.config();
connectDB();

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url || '', true);
    
    if (req.method === 'GET' && parsedUrl.pathname === '/movies') {
        await movieRoutes.getAllMovies(req, res);
    } else if (req.method === 'POST' && parsedUrl.pathname === '/movies') {
        await movieRoutes.createMovie(req, res);
    } else if (req.method === 'DELETE' && parsedUrl.pathname?.startsWith('/movies/')) {
        await movieRoutes.deleteMovie(req, res);
    } else if (req.method === 'PUT' && parsedUrl.pathname?.startsWith('/movies/')) {
        await movieRoutes.updateMovie(req, res);
    } else if (req.method === 'POST' && parsedUrl.pathname === '/directors') {
        await directorRoutes.createDirector(req, res);
    } else if (req.method === 'DELETE' && parsedUrl.pathname?.startsWith('/directors/')) {
        await directorRoutes.deleteDirector(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
