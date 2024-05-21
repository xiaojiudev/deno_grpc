import { getPostsCollection } from "../model/db.ts";
import { Post, PostResponse } from "../types/social_media.d.ts";

export class CreatePostCommandHandler {
    async handle(post: Post): Promise<PostResponse> {
        const Posts = await getPostsCollection();
        const insetId = await Posts.insertOne(post);
        
        return { success: !!insetId };
    }
}