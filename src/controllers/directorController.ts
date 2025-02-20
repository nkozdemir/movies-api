import { IncomingMessage, ServerResponse } from 'http';
import { createDirector, deleteDirector } from '../services/directorService';
import { parse } from 'url';

export const directorController = {
    createDirector: async (req: IncomingMessage, res: ServerResponse) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const directorData = JSON.parse(body);
                const newDirector = await createDirector(directorData);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newDirector));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid director data' }));
            }
        });
    },

    deleteDirector: async (req: IncomingMessage, res: ServerResponse) => {
        const parsedUrl = parse(req.url || '', true);
        const directorId = parsedUrl.pathname?.split('/')[2];

        try {
            const deletedDirector = await deleteDirector(directorId as string);
            if (!deletedDirector) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Director not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Director deleted successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error deleting director' }));
        }
    }
};
