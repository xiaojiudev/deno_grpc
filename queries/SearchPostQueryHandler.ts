import { Post, PostList, SearchRequest } from "../deps.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { POST_INDEX } from "../constant/index.ts";
import { IPost } from "../models/PostSchema.ts";

export class SearchPostQueryHandler {
	async handle(request: SearchRequest): Promise<PostList> {
		const searchRequest = request?.search ?? "";
		const queryString = searchRequest.trim();

		const postQueries = await queryEs({
			index: POST_INDEX,
			query: {
				multi_match: {
					fields: ["title", "content", "categories"],
					query: queryString,
					fuzziness: "AUTO", // Fuzzy search
				},
			},
			size: 10,
			sort: [{ "trendingScore": "desc" }],
		});

		if (postQueries) {
			// deno-lint-ignore no-explicit-any
			const mappedData = postQueries.map((postEs: any) => {
				const post = postEs._source as IPost;

				return {
					id: post.id?.toString(),
					userId: post.user.toString(),
					title: post.title,
					content: post.content,
				} as Post;
			});

			return { posts: [...mappedData] };
		}

		return { posts: [] };
	}
}
