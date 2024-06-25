import { POST_INDEX } from "../constant/index.ts";
import { UserCollection } from "../models/UserSchema.ts";
import { indexEsDocument } from "../db/elasticsearch.ts";
import { IPost, PostCollection } from "../models/PostSchema.ts";
import { mongoose, Post, PostResponse, validObjectId } from "../deps.ts";

export class CreatePostCommandHandler {
	public async handle(post: Post): Promise<PostResponse> {
		const { userId, title, content } = post;

		const checkValidPostRes = await this.checkValidPost(post);

		if (!checkValidPostRes.success) {
			return checkValidPostRes;
		}

		const payload: IPost = {
			title,
			content,
			user: new mongoose.Types.ObjectId(userId),
		};

		const insetDoc = await PostCollection.create({ ...payload });

		if (insetDoc) {
			await indexEsDocument(POST_INDEX, { ...insetDoc.toClient() });

			return {
				success: !!insetDoc,
				message: "Post created successfully",
				post: {
					id: insetDoc.getId(),
					userId: insetDoc.get('user').toString(),
					title: insetDoc.get('title'),
					content: insetDoc.get('content'),
				},
			};
		}

		return {
			success: false,
			message: "Something went wrong",
		};
	}

	private async checkValidPost(post: Post) {
		const { userId, title, content } = post;

		if (!userId || !validObjectId(userId)) {
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

		const existingUser = await UserCollection.findById(userId);

		if (!existingUser) {
			return {
				success: false,
				message: "User not found",
			};
		}

		return {
			success: true,
			message: "Post is valid"
		};
	}
}
