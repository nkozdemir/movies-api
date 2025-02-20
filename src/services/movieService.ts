import { Movie, IMovie } from '../models/movie';
import redisClient from '../config/redis';

export const getAllMovies = async (): Promise<IMovie[]> => {
    const cacheKey = 'allMovies';

    // Check Redis cache first
    const cachedMovies = await redisClient.get(cacheKey);
    if (cachedMovies) {
        return JSON.parse(cachedMovies);
    }

    // Fetch from MongoDB if not in cache
    const movies = await Movie.find().populate('director');

    // Store in Redis (expire in 1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(movies));

    return movies;
};

export const createMovie = async (movieData: Partial<IMovie>): Promise<IMovie> => {
    const newMovie = new Movie(movieData);
    await redisClient.del('allMovies'); // Clears cached movies when modifying data
    return await newMovie.save();
};

export const updateMovie = async (id: string, movieData: Partial<IMovie>): Promise<IMovie | null> => {
    await redisClient.del('allMovies'); // Clears cached movies when modifying data
    return await Movie.findByIdAndUpdate(id, movieData, { new: true });
};

export const deleteMovie = async (id: string): Promise<IMovie | null> => {
    await redisClient.del('allMovies'); // Clears cached movies when modifying data
    return await Movie.findByIdAndDelete(id);
};
