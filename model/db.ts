import { Post } from "../types/social_media.d.ts";
import { Database, MongoClient, Collection } from "../deps.ts";
import { APP_DATABASE_NAME, APP_DATABASE_URI } from "../utils/bootstrap.ts";

let client: MongoClient | null = null;
let db: Database | null = null;
let postsCollection: Collection<Post> | null = null;

export const connectDB = async () => {
    if (client && db) {
        return { client, db };
    }

    client = new MongoClient();

    await client.connect(APP_DATABASE_URI);
    db = client.database(APP_DATABASE_NAME);
    console.log("Connected to MongoDB");

    return { client, db };
}

export const getDB = () => {
    if (!db) {
        throw new Error("Database connection failed");
    }

    return db;
}

export const getPostsCollection = async () => {
    if (postsCollection) {
        return postsCollection;
    }

    const db = await getDB();
    postsCollection = db.collection<Post>("post");
    return postsCollection;
}
