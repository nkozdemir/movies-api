import { Director, IDirector } from '../models/director';

export const createDirector = async (directorData: Partial<IDirector>): Promise<IDirector> => {
    const newDirector = new Director(directorData);
    return await newDirector.save();
};

export const deleteDirector = async (id: string): Promise<IDirector | null> => {
    return await Director.findByIdAndDelete(id);
};
