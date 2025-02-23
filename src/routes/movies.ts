import { movieController } from "../controllers/movieController";

export const movieRoutes = {
  getAllMovies: movieController.getAllMovies,
  createMovie: movieController.createMovie,
  updateMovie: movieController.updateMovie,
  deleteMovie: movieController.deleteMovie,
};
