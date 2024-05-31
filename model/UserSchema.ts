import { Bson, Collection } from "../deps.ts";
import { getDB } from '../db/mongodb.ts';

export interface UserSchema {
    _id?: Bson.ObjectId;
    username: string;
    password: string;
    favoriteCategories: string[];
    interactions: UserInteractionSchema;
    recommendedPosts?: Bson.ObjectId[];
}

export interface UserInteractionSchema {
    likedPosts: Bson.ObjectId[];
    bookmarkedPosts: Bson.ObjectId[];
    clickedPosts: Bson.ObjectId[];
}

let usersCollection: Collection<UserSchema> | null = null;

export const getUsersCollection = async () => {
    if (usersCollection) {
        return usersCollection;
    }

    const db = await getDB();
    usersCollection = db.collection<UserSchema>("users");
    return usersCollection;
}
