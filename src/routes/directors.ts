import { directorController } from '../controllers/directorController';

export const directorRoutes = {
    createDirector: directorController.createDirector,
    deleteDirector: directorController.deleteDirector,
};
