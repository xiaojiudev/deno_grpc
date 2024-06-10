import { Empty, PostList } from "../deps.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { PostES } from "./GetPostQueryHandler.ts";

export class GetTrendingPostsQueryHandler {
	async handle(_request: Empty): Promise<PostList> {
		const trendingPosts = await queryEs({
			index: POST_INDEX,
			size: 10,
			query: {
				function_score: {
					score_mode: "multiply",
					boost_mode: "multiply",
					functions: [
						{
							gauss: {
								"createdAt": {
									origin: 'now/d',
									scale: '7d',
									decay: 0.5,
								}
							},
						},
					],
					query: {
						bool: {
							should: [
								{
									term: { "createdAt": 'now/d', }
								},
								{
									range: {
										"createdAt": {
											gte: "now-7d/d",
											lte: "now/d"
										}
									},
								},
							]
						}
					}
				}
			},
			sort: [
				{ "trendingScore": "desc", "createdAt": "desc" },
			],
		});

		if (trendingPosts) {
			// deno-lint-ignore no-explicit-any
			const mappedData = trendingPosts.map((postEs: any) => {
				const post = postEs._source as PostES;

				return {
					...post,
					_id: post.id?.toString(),
				};
			});

			return { posts: [...mappedData] };
		}

		return { posts: [] };
	}
}
