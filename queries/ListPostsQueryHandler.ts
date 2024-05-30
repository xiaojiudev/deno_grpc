import { Empty, Post, PostList, } from "../deps.ts";
import { PostSchema, getPostsCollection } from "../model/PostSchema.ts";
import { queryEs } from '../db/elasticsearch.ts';
import { PostES } from './GetPostQueryHandler.ts';

export class ListPostQueryHandler {
    async handle(_query: Empty): Promise<PostList> {
        const postData = await queryEs({
            index: 'posts',
            query: {
                match_all: {},
            },
            sort: [{ "trendingScore": "desc" }],
        });

        if (postData) {
            // deno-lint-ignore no-explicit-any
            const mappedData = postData.map((postEs: any) => {
                const post = postEs._source as PostES;

                return {
                    _id: post.id?.toString(),
                    title: post.title,
                    content: post.content,
                    categories: post.categories,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                }
            });

            return { posts: [...mappedData] }
        }

        return { posts: [] }
    }
}