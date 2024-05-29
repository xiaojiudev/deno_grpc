import { Bson, Collection } from "../deps.ts";
import { getDB } from '../db/mongodb.ts';

export interface PostSchema {
    _id?: Bson.ObjectId;
    title: string
    content: string
    categories: string[]
    interactions: InteractionSchema;
    trendingScore?: number
    createdAt?: Date
    updatedAt?: Date
}

export interface InteractionSchema {
    likes: number
    comments: number
    shares: number
    clicked: number
    profileClicked: number
    bookmarked: number
    photoExpanded: number
    videoPlayback: number
}

let postsCollection: Collection<PostSchema> | null = null;

export const getPostsCollection = async () => {
    if (postsCollection) {
        return postsCollection;
    }

    const db = await getDB();
    postsCollection = db.collection<PostSchema>("post");
    return postsCollection;
}
