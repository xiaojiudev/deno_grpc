import { Empty, PostList } from "../deps.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { PostES } from './GetPostQueryHandler.ts';

export class GetTrendingPostsQueryHandler {
    async handle(_request: Empty): Promise<PostList> {
        const trendingPosts = await queryEs({
            index: 'posts',
            size: 10,
            sort: [
                { "trendingScore": "desc" },
            ],
        });

        if (trendingPosts) {
            // deno-lint-ignore no-explicit-any
            const mappedData = trendingPosts.map((postEs: any) => {
                const post = postEs._source as PostES;

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