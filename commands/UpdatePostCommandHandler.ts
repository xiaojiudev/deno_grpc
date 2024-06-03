import { Bson, ObjectId, Post, PostResponse } from "../deps.ts";
import { getPostsCollection, InteractionSchema, PostSchema } from "../model/PostSchema.ts";
import { updateEsDocument } from "../db/elasticsearch.ts";

export class UpdatePostCommandHandler {
	async handle(post: Post): Promise<PostResponse> {
		if (!post.userId || !ObjectId.isValid(post.userId)) {
			return {
				success: false,
				message: "User ID not valid",
			};
		}

		if (!post._id || !Bson.ObjectId.isValid(post._id.toString())) {
			console.log("Not a valid ID");
			return {
				success: false,
				message: "Post Id is invalid",
			};
		}

		if (
			!post.title || !post.content || !post.categories || post.title?.trim().length === 0 ||
			post.content?.trim().length === 0
		) {
			return {
				success: false,
				message: "Title, content, categories are not empty",
			};
		}

		const postId = new Bson.ObjectId(post._id);
		const userId = new Bson.ObjectId(post.userId);
		const PostCollection = await getPostsCollection();

		const filter = { _id: postId, userId: userId };
		const postRetrieve = await PostCollection.findOne(filter);

		if (!postRetrieve) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		const result = await PostCollection.updateOne(filter, {
			$set: {
				title: post.title ?? postRetrieve?.title,
				content: post.content ?? postRetrieve?.content,
				categories: post.categories ?? postRetrieve?.categories,
				interactions: Object.values(post?.interactions as InteractionSchema).length > 0
					? post?.interactions as InteractionSchema
					: postRetrieve?.interactions as InteractionSchema,
				updatedAt: new Date(),
			},
		});

		if (result.matchedCount === 0) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		const postUpdated = await PostCollection.findOne(filter);
		const { _id, ...postUpdatedData } = postUpdated!;

		await updateEsDocument("posts", postId!.toString(), {
			id: postId!.toString(),
			...postUpdatedData,
		});

		return {
			success: true,
			message: "Update post successfully",
		};
	}
}
