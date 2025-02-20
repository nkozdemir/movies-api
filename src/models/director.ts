import mongoose, { Document, Schema } from 'mongoose';

export interface IDirector extends Document {
    firstName: string;
    lastName: string;
    birthDate: Date;
    bio: string;
}

const DirectorSchema = new Schema<IDirector>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    bio: { type: String, required: true },
});

export const Director = mongoose.model<IDirector>('Director', DirectorSchema);
