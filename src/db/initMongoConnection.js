import 'dotenv/config';
import mongoose from 'mongoose';

export const initMongoConnection = async () => {
  try {
    const connectionString = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}`;
    await mongoose.connect(connectionString);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

// mongodb+srv://OlhaHoiko:<db_password>@hw1.4xupi.mongodb.net/?retryWrites=true&w=majority&appName=HW1
