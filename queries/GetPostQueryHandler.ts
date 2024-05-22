import { Bson, GrpcStatus, GrpcException, Post, PostRequest, getPostsCollection } from "../deps.ts";

export class GetPostQueryHandler {
    async handle(query: PostRequest): Promise<Post> {
        if (!query._id || !Bson.ObjectId.isValid(query._id)) {
            throw GrpcException(GrpcStatus.INVALID_ARGUMENT, "Invalid id");
        }

        const PostCollection = await getPostsCollection();
        const post = await PostCollection.findOne({ _id: new Bson.ObjectId(query._id) });

        if (!post) {
            throw GrpcException(GrpcStatus.NOT_FOUND, "No post found");
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