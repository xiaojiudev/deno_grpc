import { Bson, GrpcException, GrpcStatus, Post, PostRequest } from "../deps.ts";
import { getPostsCollection } from "../model/PostSchema.ts";
import { queryEs } from "../db/elasticsearch.ts";

export interface PostES extends Post {
	id: string;
}

export class GetPostQueryHandler {
	async handle(query: PostRequest): Promise<Post> {
		if (!query._id || !Bson.ObjectId.isValid(query._id)) {
			throw Error("Invalid ID");
		}

		const postQuery = await queryEs({
			index: "posts",
			query: {
				query_string: {
					fields: ["id"],
					query: query._id,
				},
			},
		});

		if (postQuery) {
			const postData = postQuery[0]._source as PostES;

			return {
				...postData,
				_id: postData.id,
			};
		}

		return {} as Post;
	}
}
