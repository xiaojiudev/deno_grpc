import { getPostsCollection } from "../model/PostSchema.ts";
import { Bson, PostRequest, PostResponse } from "../deps.ts";
import { deleteEsDocument } from "../db/elasticsearch.ts";

export class DeletePostCommandHandler {
    async handle(post: PostRequest): Promise<PostResponse> {
        if (!post._id || !Bson.ObjectId.isValid(post._id.toString())) {
            console.log("Not a valid ID");
            return {
                success: false,
                message: "Post Id is invalid",
            };
        }

        const postId = new Bson.ObjectId(post._id);
        const PostCollection = await getPostsCollection();

        const filter = { _id: postId };

        const deleteCount = await PostCollection.deleteOne(filter);

        if (deleteCount === 0) {
            return {
                success: false,
                message: "Post not found",
            }
        }

        await deleteEsDocument("posts", postId.toString());

        return {
            success: true,
            message: "Delete post successfully",
        };
    }
}