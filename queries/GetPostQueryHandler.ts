import { Post, PostRequest, validObjectId } from "../deps.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { IPost } from "../model/PostSchema.ts";
import { POST_INDEX } from "../constant/index.ts";

export class GetPostQueryHandler {
	async handle(query: PostRequest): Promise<Post> {
		if (!query.id || !validObjectId(query.id)) {
			// throw Error("Invalid ID");
		}

		const postQuery = await queryEs({
			index: POST_INDEX,
			query: {
				query_string: {
					fields: ["id"],
					query: query.id,
				},
			},
		});

		const result = {
			id: '',
			userId: '',
			title: '',
			content: ''
		}

		if (postQuery) {
			const postData = postQuery[0]._source as IPost;

			return {
				id: postData.id?.toString(),
				userId: postData.user.toString(),
				title: postData.title,
				content: postData.content
			}
		}

		return result;
	}
}
