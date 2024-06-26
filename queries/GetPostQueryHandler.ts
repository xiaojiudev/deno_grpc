import { PostRequest, PostResponse, validObjectId } from "../deps.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { IPost } from "../models/PostSchema.ts";
import { POST_INDEX } from "../constant/index.ts";

export class GetPostQueryHandler {
	async handle(query: PostRequest): Promise<PostResponse> {
		if (!query.id || !validObjectId(query.id)) {
			/*
				Deno and grpc_basic haven't supported grpc server error/status response yet!
				https://github.com/denoland/deno/issues/23714
				https://github.com/denoland/deno/issues/3326 

 				should throw new Error("Invalid ID");
			*/
			return {
				success: false,
				message: "Invalid ID",
			}
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

		if (postQuery && postQuery.length > 0) {
			const postData = postQuery[0]._source as IPost;
						
			return {
				success: true,
				message: "Post found",
				post: {
					id: postData.id?.toString(),
					userId: postData.user.toString(),
					title: postData.title,
					content: postData.content,
				}
			};
		}

		return {
			success: false,
			message: "Post not found",
		};
	}
}
