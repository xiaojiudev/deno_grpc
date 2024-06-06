import { PostCollection } from "../model/PostSchema.ts";
import { PostRequest, PostResponse, mongoose, validObjectId } from "../deps.ts";
import { deleteEsDocumentById } from "../db/elasticsearch.ts";

export class DeletePostCommandHandler {
	async handle(post: PostRequest): Promise<PostResponse> {
		if (!post.id || !validObjectId(post.id.toString())) {
			return {
				success: false,
				message: "Post Id is invalid",
			};
		}

		const postId = new mongoose.Types.ObjectId(post.id);

		const docRes = await PostCollection.deleteOne({_id: postId});
		
		if (docRes.deletedCount === 0) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		await deleteEsDocumentById("posts", postId.toString());

		return {
			success: true,
			message: "Delete post successfully",
		};
	}
}
