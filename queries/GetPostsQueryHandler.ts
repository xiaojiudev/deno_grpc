import { Empty, Post, PostList } from "../deps.ts";
import { IPost } from "../models/PostSchema.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { POST_INDEX } from "../constant/index.ts";

export class GetPostsQueryHandler {
	async handle(_query: Empty): Promise<PostList> {
		const postData = await queryEs({
			index: POST_INDEX,
			query: {
				match_all: {},
			},
		});

		if (postData) {
			const mappedData = postData.map((postEs: unknown) => {
				if (postEs instanceof Object && "_source" in postEs) {
					const post = postEs._source as IPost;

					return {
						id: post.id?.toString(),
						userId: post.user.toString(),
						title: post.title,
						content: post.content,
					} as Post;
				} else {
					return null;
				}

			}).filter((post): post is Post => post !== null);

			return { posts: [...mappedData] };
		}

		return { posts: [] };
	}
}
