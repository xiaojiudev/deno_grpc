import { PostList, SearchRequest } from '../deps.ts';
import { queryEs } from '../db/elasticsearch.ts';
import { PostES } from './GetPostQueryHandler.ts';

export class SearchPostQueryHandler {
    async handle(request: SearchRequest): Promise<PostList> {
        const searchRequest = request?.search ?? "";
        const queryString = searchRequest.trim();

        const postQueries = await queryEs({
            index: 'posts',
            query: {
                multi_match: {
                    fields: ["title", "content", "categories"],
                    type: 'phrase',
                    query: queryString,
                }
            },
            size: 10,
            sort: [{ "trendingScore": "desc" }],
        });

        if (postQueries) {
            // deno-lint-ignore no-explicit-any
            const mappedData = postQueries.map((postEs: any) => {
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