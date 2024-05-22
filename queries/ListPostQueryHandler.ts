import { Empty, Post, PostList, PostSchema, getPostsCollection } from "../deps.ts";

export class ListPostQueryHandler {
    async handle(_query: Empty): Promise<PostList> {
        const PostCollection = await getPostsCollection();
        const data = await PostCollection.find({}).toArray();

        const mappedData: Post[] = data.map((post: PostSchema) => {
            return {
                ...post,
                _id: post._id?.toString(),
                createdAt: post.createdAt?.toISOString(),
                updatedAt: post.updatedAt?.toISOString(),
            }
        })

        return { posts: [...mappedData] }
    }
}