import { PostCollection } from "../models/PostSchema.ts";
import { generateObjectId, PostRequest, PostResponse, validObjectId } from "../deps.ts";
import { deleteEsDocumentById } from "../db/elasticsearch.ts";

export class DeletePostCommandHandler {
	public async handle(post: PostRequest): Promise<PostResponse> {
		const checkValidPostRes = this.checkValidPost(post);

		if (!checkValidPostRes.success) {
			return checkValidPostRes;
		}

		const postObjectId = generateObjectId(post.id);

		const docRes = await PostCollection.deleteOne({ _id: postObjectId });

		if (docRes.deletedCount === 0) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		await deleteEsDocumentById("posts", postObjectId.toString());

		return {
			success: true,
			message: "Delete post successfully",
		};
	}

	private checkValidPost(post: PostRequest): PostResponse {
		if (!post.id || !validObjectId(post.id.toString())) {
			return {
				success: false,
				message: "PostId is invalid",
			};
		}

		return {
			success: true,
			message: "Post is valid",
		};
	}
}
