import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Director } from '../models/director';
import { Movie } from '../models/movie';

dotenv.config();

const directors = [
    {
        firstName: "Christopher",
        lastName: "Nolan",
        birthDate: new Date("1970-07-30"),
        bio: "British-American film director known for mind-bending narratives"
    },
    {
        firstName: "Martin",
        lastName: "Scorsese",
        birthDate: new Date("1942-11-17"),
        bio: "American film director, producer, and screenwriter"
    },
    {
        firstName: "Quentin",
        lastName: "Tarantino",
        birthDate: new Date("1963-03-27"),
        bio: "American film director, screenwriter, and actor"
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/moviesDB');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Director.deleteMany({});
        await Movie.deleteMany({});
        console.log('Cleared existing data');

        // Insert directors
        const createdDirectors = await Director.insertMany(directors);
        console.log('Directors added successfully');

        // Create movies with references to directors
        const movies = [
            {
                title: "Inception",
                description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                releaseDate: new Date("2010-07-16"),
                genre: "Sci-Fi",
                rating: 8.8,
                imdbId: "tt1375666",
                director: createdDirectors[0]._id // Christopher Nolan
            },
            {
                title: "The Wolf of Wall Street",
                description: "Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.",
                releaseDate: new Date("2013-12-25"),
                genre: "Biography",
                rating: 8.2,
                imdbId: "tt0993846",
                director: createdDirectors[1]._id // Martin Scorsese
            },
            {
                title: "Pulp Fiction",
                description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                releaseDate: new Date("1994-10-14"),
                genre: "Crime",
                rating: 8.9,
                imdbId: "tt0110912",
                director: createdDirectors[2]._id // Quentin Tarantino
            },
            {
                title: "The Dark Knight",
                description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                releaseDate: new Date("2008-07-18"),
                genre: "Action",
                rating: 9.0,
                imdbId: "tt0468569",
                director: createdDirectors[0]._id // Christopher Nolan
            }
        ];

        await Movie.insertMany(movies);
        console.log('Movies added successfully');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 