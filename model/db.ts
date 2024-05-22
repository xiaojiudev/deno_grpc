import {Bson, Database, MongoClient, Collection, APP_DATABASE_URI, APP_DATABASE_NAME } from "../deps.ts";

export interface PostSchema {
    _id?: Bson.ObjectId;
    title: string
    content: string
    categories: string[]
    createdAt?: Date
    updatedAt?: Date
}

let client: MongoClient | null = null;
let db: Database | null = null;
let postsCollection: Collection<PostSchema> | null = null;

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
    postsCollection = db.collection<PostSchema>("post");
    return postsCollection;
}
