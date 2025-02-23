import { Movie, IMovie } from "../models/movie";
import redisClient from "../config/redis";

export const getAllMovies = async (): Promise<IMovie[]> => {
  try {
    const cacheKey = "allMovies";

    try {
      // Check Redis cache first
      const cachedMovies = await redisClient.get(cacheKey);
      if (cachedMovies) {
        return JSON.parse(cachedMovies);
      }
    } catch (redisError) {
      // If Redis fails, continue with database query
      console.error("Redis error:", redisError);
    }

    // Fetch from MongoDB
    const movies = await Movie.find().populate("director");

    // Try to store in Redis, but don't fail if Redis is unavailable
    try {
      await redisClient.set(cacheKey, JSON.stringify(movies), {
        EX: 3600,
      });
    } catch (redisError) {
      console.error("Redis caching error:", redisError);
    }

    return movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const createMovie = async (
  movieData: Partial<IMovie>,
): Promise<IMovie> => {
  const newMovie = new Movie(movieData);
  try {
    await redisClient.del("allMovies"); // Clear cache
  } catch (redisError) {
    console.error("Redis error clearing cache:", redisError);
  }
  return await newMovie.save();
};

export const updateMovie = async (
  id: string,
  movieData: Partial<IMovie>,
): Promise<IMovie | null> => {
  try {
    await redisClient.del("allMovies"); // Clear cache
  } catch (redisError) {
    console.error("Redis error clearing cache:", redisError);
  }
  return await Movie.findByIdAndUpdate(id, movieData, { new: true });
};

export const deleteMovie = async (id: string): Promise<IMovie | null> => {
  try {
    await redisClient.del("allMovies"); // Clear cache
  } catch (redisError) {
    console.error("Redis error clearing cache:", redisError);
  }
  return await Movie.findByIdAndDelete(id);
};
