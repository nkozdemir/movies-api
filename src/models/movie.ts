import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  title: string;
  description: string;
  releaseDate: Date;
  genre: string;
  rating: number;
  imdbId: string;
  director: mongoose.Types.ObjectId;
}

const MovieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  imdbId: { type: String, required: true, unique: true },
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Director",
    required: true,
  },
});

export const Movie = mongoose.model<IMovie>("Movie", MovieSchema);
