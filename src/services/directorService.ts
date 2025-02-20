import { Movie } from '@/models/movie';
import { Director, IDirector } from '../models/director';

export const createDirector = async (directorData: Partial<IDirector>): Promise<IDirector> => {
    const newDirector = new Director(directorData);
    return await newDirector.save();
};

export const deleteDirector = async (id: string): Promise<IDirector | null> => {
    // Check if the director exists
    const director = await Director.findById(id);
    if (!director) {
        throw new Error('Director not found');
    }
    // Check if the director has any movies
    const movies = await Movie.find({ director: id });
    if (movies.length > 0) {
        throw new Error('Director has movies, cannot delete');
    }
    // Delete the director
    return await Director.findByIdAndDelete(id);
};
