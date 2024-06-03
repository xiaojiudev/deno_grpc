import { ObjectId, Post, PostResponse } from "../deps.ts";
import { getPostsCollection, PostSchema } from "../model/PostSchema.ts";
import { indexEsDocument } from "../db/elasticsearch.ts";
import { getUsersCollection } from "../model/UserSchema.ts";

export class CreatePostCommandHandler {
	async handle(post: Post): Promise<PostResponse> {
		const { userId, title, content, categories } = post;

		if (!userId || !ObjectId.isValid(userId)) {
			return {
				success: false,
				message: "User ID not valid",
			};
		}

		if (!title || !content || title?.trim().length === 0 || content?.trim().length === 0) {
			return {
				success: false,
				message: "Title and content are not empty",
			};
		}

		const PostCollection = await getPostsCollection();
		const UserCollection = await getUsersCollection();

		const existingUser = await UserCollection.findOne({
			_id: new ObjectId(userId),
		});

		if (!existingUser) {
			return {
				success: false,
				message: "User not found",
			};
		}

		const payload: PostSchema = {
			_id: new ObjectId(),
			title,
			content,
			userId: existingUser._id!,
			categories: categories ?? [],
			interactions: {
				likes: 0,
				comments: 0,
				shares: 0,
				clicked: 0,
				profileClicked: 0,
				bookmarked: 0,
				photoExpanded: 0,
				videoPlayback: 0,
			},
			trendingScore: 0.0,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const insetId = await PostCollection.insertOne({ ...payload });
		if (insetId) {
			indexEsDocument("posts", { id: insetId.toString(), ...payload });
			return {
				success: !!insetId,
				message: "Post created successfully",
			};
		}

		return {
			success: false,
			message: "Something went wrong",
		};
	}
}
