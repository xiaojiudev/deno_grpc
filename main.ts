import { GrpcServer } from "./deps.ts";
import { connectDB } from "./model/db.ts";
import { CreatePostCommandHandler } from "./commands/CreatePostCommandHandler.ts";
import { Empty, KeywordList, Post, PostList, PostRequest, PostResponse, SocialMediaService, UserRequest } from "./types/social_media.d.ts";
import { APP_GRPC_PORT } from "./utils/bootstrap.ts";


const server = new GrpcServer();

startServer();

async function startServer(): Promise<void> {
    try {
        await connectDB();
        await gRPCServer();
        console.log(`gRPC server gonna listen on ${APP_GRPC_PORT} port`);
        for await (const conn of Deno.listen({ port: APP_GRPC_PORT })) {
            server.handle(conn);
        }
    } catch (error) {
        console.log("Start server failed!", error);
    }
}

async function gRPCServer() {

    const protoPath = new URL("./protos/social_media.proto", import.meta.url);
    const protoFile = await Deno.readTextFile(protoPath);

    server.addService<SocialMediaService>(protoFile, {
        CreatePost: async (call) => {
            const handler = new CreatePostCommandHandler();
            return await handler.handle(call);
        },
        GetPost: function (request: PostRequest): Promise<Post> {
            throw new Error("Function not implemented.");
        },
        UpdatePost: function (request: Post): Promise<PostResponse> {
            throw new Error("Function not implemented.");
        },
        DeletePost: function (request: PostRequest): Promise<PostResponse> {
            throw new Error("Function not implemented.");
        },
        ListPost: function (request: Empty): Promise<Empty> {
            throw new Error("Function not implemented.");
        },
        ListTrendingPosts: function (request: Empty): Promise<PostList> {
            throw new Error("Function not implemented.");
        },
        ListTrendingKeywords: function (request: Empty): Promise<KeywordList> {
            throw new Error("Function not implemented.");
        },
        RecommendPosts: function (request: UserRequest): Promise<PostList> {
            throw new Error("Function not implemented.");
        }
    });
}


