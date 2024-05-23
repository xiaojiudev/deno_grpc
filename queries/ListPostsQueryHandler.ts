import { Empty, Post, PostList, } from "../deps.ts";
import { PostSchema, getPostsCollection } from "../model/PostSchema.ts";

export class ListPostQueryHandler {
    async handle(_query: Empty): Promise<PostList> {
        const PostCollection = await getPostsCollection();
        const allPosts = await PostCollection.find({}).toArray();

        const mappedData: Post[] = await allPosts.map((post: PostSchema) => {
            return {
                _id: post._id?.toString(),
                title: post.title,
                content: post.content,
                categories: post.categories,
                createdAt: post.createdAt?.toISOString(),
                updatedAt: post.updatedAt?.toISOString(),
            }
        });

        const result: PostList = {
            posts: [...mappedData],
        };

    
        return result;
    }
}