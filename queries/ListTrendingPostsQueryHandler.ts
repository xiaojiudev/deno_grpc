import { Empty, PostList } from "../deps.ts";
import { queryEs } from "../model/es.ts";

export class ListTrendingPostsQueryHandler {
    async handle(_request: Empty): Promise<PostList> {
        const trendingPosts = await queryEs({ index: 'posts', size: 10, sort: [{ "trendingScore": "desc" }] });

        if (trendingPosts) {
            const mappedData = trendingPosts.map((postEs: any) => {
                const post = postEs._source;

                return {
                    ...post,
                    _id: post.id?.toString(),
                }
            });

            return { posts: [...mappedData] }
        }

        return { posts: [] }
    }
}