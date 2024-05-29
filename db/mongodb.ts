import { Database, MongoClient, APP_DATABASE_URI, APP_DATABASE_NAME } from "../deps.ts";

interface ConnectDB {
    client: MongoClient;
    mongoDb: Database;
}

let client: MongoClient | null = null;
let mongoDb: Database | null = null;

export const connectDB = async (): Promise<ConnectDB> => {
    if (client && mongoDb) {
        return { client, mongoDb };
    }

    client = new MongoClient();

    await client.connect(APP_DATABASE_URI);
    mongoDb = client.database(APP_DATABASE_NAME);
    console.log("Connected to MongoDB successfully");

    return { client, mongoDb };
}

export const getDB = (): Database => {
    if (!mongoDb) {
        throw new Error("Database connection failed");
    }

    return mongoDb;
}