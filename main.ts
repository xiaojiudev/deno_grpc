import {
    APP_GRPC_PORT,
    Empty,
    GrpcServer,
    KeywordList,
    Post,
    PostList,
    PostRequest,
    PostResponse,
    SocialMediaService,
    UserRequest,
} from "./deps.ts";
import { connectDB } from "./model/db.ts";
import { connectEs } from "./model/es.ts";
import { CreatePostCommandHandler } from "./commands/CreatePostCommandHandler.ts";
import { DeletePostCommandHandler } from "./commands/DeletePostCommandHandler.ts";
import { UpdatePostCommandHandler } from "./commands/UpdatePostCommandHandler.ts";
import { GetPostQueryHandler } from "./queries/GetPostQueryHandler.ts";
import { ListPostQueryHandler } from "./queries/ListPostsQueryHandler.ts";
import { getMockPostData } from "./utils/mockDB.ts";
import { updateTrendingScore } from "./services/trendingService.ts";
import { ListTrendingPostsQueryHandler } from "./queries/ListTrendingPostsQueryHandler.ts";

const grpcServer = new GrpcServer();

startServer();

async function startServer(): Promise<void> {
    try {
        await connectDB();
        await connectEs();
        await getMockPostData();
        await initGRPCServer();
        appCronJob();

        console.log(`gRPC server gonna listen on ${APP_GRPC_PORT} port`);

        for await (const conn of Deno.listen({ port: APP_GRPC_PORT, })) {
            grpcServer.handle(conn);
        }

    } catch (error) {
        console.log("Start server failed!", error);
    }
}

async function initGRPCServer() {

    const protoPath = new URL("./protos/social_media.proto", import.meta.url);
    const protoFile = Deno.readTextFileSync(protoPath);

    grpcServer.addService<SocialMediaService>(protoFile, {
        CreatePost: async (request: Post): Promise<PostResponse> => {
            try {
                const handler = new CreatePostCommandHandler();
                return await handler.handle(request);
            } catch (error) {
                throw error;
            }
        },
        UpdatePost: async (request: Post): Promise<PostResponse> => {
            try {
                const handler = new UpdatePostCommandHandler();
                return await handler.handle(request);
            } catch (error) {
                throw error;
            }
        },
        DeletePost: async (request: PostRequest): Promise<PostResponse> => {
            try {
                const handler = new DeletePostCommandHandler();
                return await handler.handle(request);
            } catch (error) {
                throw error;
            }
        },
        GetPost: async (request: PostRequest): Promise<Post> => {
            try {
                const handler = new GetPostQueryHandler();
                return await handler.handle(request);
            } catch (error) {
                throw error;
            }
        },
        ListPost: async (request: Empty): Promise<PostList> => {
            try {
                const handler = new ListPostQueryHandler();
                const data = await handler.handle(request);
                return data;
            } catch (error) {
                throw error;
            }
        },
        ListTrendingPosts: async (_request: Empty): Promise<PostList> => {
            try {
                const handler = new ListTrendingPostsQueryHandler();
                return await handler.handle(_request);
            } catch (error) {
                throw error;
            }
        },
        ListTrendingKeywords: async (_request: Empty): Promise<KeywordList> => {
            throw new Error("Function not implemented.");
        },
        RecommendPosts: async (_request: UserRequest): Promise<PostList> => {
            throw new Error("Function not implemented.");
        }
    });

}

function appCronJob() {
    Deno.cron("Update trending scores", { minute: { every: 1 } }, async () => {
        console.log("Updating trending scores...");
        await updateTrendingScore();
    });
}
