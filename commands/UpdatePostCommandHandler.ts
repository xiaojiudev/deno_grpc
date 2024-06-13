import { mongoose, Post, PostResponse, validObjectId } from "../deps.ts";
import { PostCollection } from "../model/PostSchema.ts";
import { updateEsDocument } from "../db/elasticsearch.ts";

export class UpdatePostCommandHandler {
	async handle(post: Post): Promise<PostResponse> {
		if (!post.userId || !validObjectId(post.userId)) {
			return {
				success: false,
				message: "User ID not valid",
			};
		}

		if (!post.id || !validObjectId(post.id)) {
			console.log("Not a valid ID");
			return {
				success: false,
				message: "Post Id is invalid",
			};
		}

		if (
			!post.title ||
			!post.content ||
			post.title.trim().length === 0 ||
			post.content.trim().length === 0
		) {
			return {
				success: false,
				message: "Title, content, categories are not empty",
			};
		}

		const postId = new mongoose.Types.ObjectId(post.id);
		const userId = new mongoose.Types.ObjectId(post.userId);

		const filter = { _id: postId, user: userId };
		const postRetrieve = await PostCollection.findOne(filter);

		if (!postRetrieve) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		const payloadUpdate = {
			title: post.title ?? postRetrieve?.title,
			content: post.content ?? postRetrieve?.content,
			updatedAt: new Date(),
		};

		const docRes = await PostCollection.findOneAndUpdate(
			filter,
			payloadUpdate,
			{ includeResultMetadata: true },
		);

		if (!docRes.ok) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		const postUpdatedData = docRes.value?.toClient();

		await updateEsDocument("posts", postId.toString(), {
			...postUpdatedData,
		});

		return {
			success: true,
			message: "Update post successfully",
		};
	}
}
