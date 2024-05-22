import { PostSchema } from "../deps.ts";
import { Post, PostResponse, getPostsCollection } from "../deps.ts";

export class CreatePostCommandHandler {
    async handle(post: Post): Promise<PostResponse> {
        const PostCollection = await getPostsCollection();

        const { title, content, categories } = post;
        
        const payload: PostSchema = {
            title,
            content,
            categories,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const insetId = await PostCollection.insertOne({ ...payload, });

        return { success: !!insetId };
    }
}