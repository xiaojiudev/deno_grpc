import { Empty, PostList } from "../deps.ts";
import { PostSchema, getPostsCollection } from "../model/PostSchema.ts";

export class ListTrendingPostsQueryHandler {
    async handle(_request: Empty): Promise<PostList> {
        const PostCollection = await getPostsCollection();
        const data = await PostCollection.find({})
            .sort({ trendingScore: -1 })
            .limit(10)
            .toArray();

        const mappedData = data.map((post: PostSchema) => {
            return {
                ...post,
                _id: post._id?.toString(),
                createdAt: post.createdAt?.toISOString(),
                updatedAt: post.updatedAt?.toISOString(),
            }
        });

        return { posts: [...mappedData] }
    }
}