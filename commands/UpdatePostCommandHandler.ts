import { Bson, Post, PostResponse, } from "../deps.ts";
import { InteractionSchema, PostSchema, getPostsCollection } from "../model/PostSchema.ts";
import { updateEsDocument } from "../db/elasticsearch.ts";

export class UpdatePostCommandHandler {
    async handle(post: Post): Promise<PostResponse> {
        if (!post._id || !Bson.ObjectId.isValid(post._id.toString())) {
            console.log("Not a valid ID");
            return {
                success: false,
                message: "Post Id is invalid",
            };
        }

        if (!post.title || !post.content || !post.categories || post.title?.trim().length === 0 || post.content?.trim().length === 0) {
            return {
                success: false,
                message: "Title, content, categories are not empty",
            }
        }

        const postId = new Bson.ObjectId(post._id);
        const PostCollection = await getPostsCollection();

        const filter = { _id: postId };
        const postRetrieve = await PostCollection.findOne(filter);

        const payloadUpdate: PostSchema = {
            title: post.title ?? postRetrieve?.title,
            content: post.content ?? postRetrieve?.content,
            categories: post.categories ?? postRetrieve?.categories,
            interactions: Object.values(post?.interactions as InteractionSchema).length > 0 ?
                post?.interactions as InteractionSchema
                : postRetrieve?.interactions as InteractionSchema,
            updatedAt: new Date(),
        }

        const update = { $set: payloadUpdate };
        const result = await PostCollection.updateOne(filter, update);

        if (result.matchedCount === 0) {
            return {
                success: false,
                message: "Post not found",
            }
        }

        await updateEsDocument("posts", postId!.toString(), { id: postId!.toString(), ...payloadUpdate });

        return {
            success: true,
            message: "Update post successfully",
        };
    }
}