import { Bson, GrpcStatus, GrpcException, Post, PostRequest } from "../deps.ts";
import { getPostsCollection } from "../model/PostSchema.ts";

export class GetPostQueryHandler {
    async handle(query: PostRequest): Promise<Post> {
        if (!query._id || !Bson.ObjectId.isValid(query._id)) {
            throw GrpcException(GrpcStatus.INVALID_ARGUMENT, "Invalid id");
        }

        const PostCollection = await getPostsCollection();
        const post = await PostCollection.findOne({ _id: new Bson.ObjectId(query._id) });

        if (!post) {
            return {} as Post;
        }

        const mappedData: Post = {
            ...post,
            _id: post._id?.toString(),
            createdAt: post.createdAt?.toISOString(),
            updatedAt: post.updatedAt?.toISOString(),
        };

        return mappedData;
    }
}