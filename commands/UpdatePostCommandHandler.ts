import { Bson, Post, PostResponse, getPostsCollection } from "../deps.ts";

export class UpdatePostCommandHandler {
    async handle(post: Post): Promise<PostResponse> {
        if (!post._id || !Bson.ObjectId.isValid(post._id.toString())) {
            console.log("Not a valid ID");
            return { success: false };
        }

        const postId = new Bson.ObjectId(post._id);
        const PostCollection = await getPostsCollection();

        const filter = { _id: postId};
        const update = { $set: { content: post.content, title: post.title, tags: post.tags } };

        const result = await PostCollection.updateOne(filter, update);

        if (result.matchedCount === 0) {
            console.log("matched", result.matchedCount);
            return { success: false }
        }

        return { success: true };
    }
}