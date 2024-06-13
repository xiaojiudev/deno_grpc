import { Empty, Post, PostList } from "../deps.ts";
import { IPost } from "../model/PostSchema.ts";
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
			// deno-lint-ignore no-explicit-any
			const mappedData = postData.map((postEs: any) => {
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
