import { Post, PostResponse, mongoose, validObjectId } from "../deps.ts";
import { IPost, PostCollection } from "../model/PostSchema.ts";
import { indexEsDocument } from "../db/elasticsearch.ts";
import { UserCollection } from "../model/UserSchema.ts";
import { POST_INDEX } from "../constant/index.ts";

export class CreatePostCommandHandler {
	async handle(post: Post): Promise<PostResponse> {
		const { userId, title, content } = post;

		if (!userId || !validObjectId(userId)) {
			return {
				success: false,
				message: "User ID not valid",
				postId: undefined,
			};
		}

		if (!title || !content || title?.trim().length === 0 || content?.trim().length === 0) {
			return {
				success: false,
				message: "Title and content are not empty",
				postId: undefined,
			};
		}

		const existingUser = await UserCollection.findById(userId);		

		if (!existingUser) {
			return {
				success: false,
				message: "User not found",
				postId: undefined,
			};
		}

		const payload:IPost = {
			title,
			content,
			user: new mongoose.Types.ObjectId(existingUser.getId()),
		};
		
		const insetDoc = await PostCollection.create({ ...payload });
		
		if (insetDoc) {
			await indexEsDocument(POST_INDEX, { ...insetDoc.toClient() });
			return {
				success: !!insetDoc,
				message: "Post created successfully",
				postId: insetDoc.getId(),
			};
		}

		return {
			success: false,
			message: "Something went wrong",
			postId: undefined,
		};
	}
}
