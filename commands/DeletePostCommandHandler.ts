import { getPostsCollection } from "../model/PostSchema.ts";
import { Bson, PostRequest, PostResponse } from "../deps.ts";

export class DeletePostCommandHandler {
    async handle(post: PostRequest): Promise<PostResponse> {
        if (!post._id || !Bson.ObjectId.isValid(post._id.toString())) {
            console.log("Not a valid ID");
            return { success: false };
        }

        const postId = new Bson.ObjectId(post._id);
        const PostCollection = await getPostsCollection();

        const filter = { _id: postId};

        const deleteCount = await PostCollection.deleteOne(filter);

        if (deleteCount === 0) {
            console.log("matched", deleteCount);
            return { success: false }
        }

        return { success: true };
    }
}