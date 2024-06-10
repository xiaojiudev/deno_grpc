import {
    Empty,
    KeywordList,
    Post,
    PostList,
    PostRequest,
    PostResponse,
    SearchRequest,
    SocialMediaService,
    UserRequest,
} from "../deps.ts";
import { getGrpcServer } from "./grpc.ts";
import { CreatePostCommandHandler } from "../commands/CreatePostCommandHandler.ts";
import { DeletePostCommandHandler } from "../commands/DeletePostCommandHandler.ts";
import { UpdatePostCommandHandler } from "../commands/UpdatePostCommandHandler.ts";
import { GetPostQueryHandler } from "../queries/GetPostQueryHandler.ts";
import { GetPostsQueryHandler } from "../queries/GetPostsQueryHandler.ts";
import { GetTrendingPostsQueryHandler } from "../queries/GetTrendingPostsQueryHandler.ts";

export const initPostService = async () => {
    const grpcServer = await getGrpcServer();

    const postProtoPath = new URL(
        "../protos/social_media.proto",
        import.meta.url,
    );
    const postProtoFile = Deno.readTextFileSync(postProtoPath);

    grpcServer.addService<SocialMediaService>(postProtoFile, {
        CreatePost: async (request: Post): Promise<PostResponse> => {
            try {
                const command = new CreatePostCommandHandler();
                return await command.handle(request);
            } catch (error) {
                throw error;
            }
        },
        UpdatePost: async (request: Post): Promise<PostResponse> => {
            try {
                const command = new UpdatePostCommandHandler();
                return await command.handle(request);
            } catch (error) {
                throw error;
            }
        },
        DeletePost: async (request: PostRequest): Promise<PostResponse> => {
            try {
                const command = new DeletePostCommandHandler();
                return await command.handle(request);
            } catch (error) {
                throw error;
            }
        },
        GetPost: async (request: PostRequest): Promise<Post> => {
            try {
                const queries = new GetPostQueryHandler();
                return await queries.handle(request);
            } catch (error) {
                throw error;
            }
        },
        GetPosts: async (request: Empty): Promise<PostList> => {
            try {
                const queries = new GetPostsQueryHandler();
                const data = await queries.handle(request);
                return data;
            } catch (error) {
                throw error;
            }
        },
        SearchPost: async (request: SearchRequest): Promise<PostList> => {
            throw new Error("Function not implemented.");
        },
        GetTrendingPosts: async (request: Empty): Promise<PostList> => {
            try {
                const queries = new GetTrendingPostsQueryHandler();
                return await queries.handle(request);
            } catch (error) {
                throw error;
            }
        },
        GetTrendingKeywords: async (request: Empty): Promise<KeywordList> => {
            throw new Error("Function not implemented.");
        },
        RecommendPosts: async (request: UserRequest): Promise<PostList> => {
            throw new Error("Function not implemented.");
        }
    });
};