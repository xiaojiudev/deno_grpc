import { generateObjectId, Post, PostResponse, validObjectId } from "../deps.ts";
import { PostCollection } from "../models/PostSchema.ts";
import { updateEsDocument } from "../db/elasticsearch.ts";

export class UpdatePostCommandHandler {
	public async handle(post: Post): Promise<PostResponse> {
		const checkValidPostRes = this.checkValidPost(post);

		if (!checkValidPostRes.success) {
			return checkValidPostRes;
		}

		const postId = generateObjectId(post.id);
		const userId = generateObjectId(post.userId);

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

		const updatedPost = await PostCollection.findOneAndUpdate(
			filter,
			payloadUpdate,
			{ new: true, includeResultMetadata: true },
		);

		if (!updatedPost.ok) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		const mappedPostData = updatedPost.value?.toClient()!;

		await updateEsDocument("posts", postId.toString(), {
			...mappedPostData,
		});

		return {
			success: true,
			message: "Update post successfully",
			post: {
				id: mappedPostData.id!.toString(),
				userId: mappedPostData.user.toString(),
				title: mappedPostData.title,
				content: mappedPostData.content,
			},
		};
	}

	private checkValidPost(post: Post): PostResponse {
		if (!post.userId || !validObjectId(post.userId)) {
			return {
				success: false,
				message: "User ID not valid",
			};
		}

		if (!post.id || !validObjectId(post.id)) {
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

		return {
			success: true,
			message: "Post is valid"
		}
	}
}
