import { CreatePostCommandHandler } from '../commands/CreatePostCommandHandler.ts';
import { DeletePostCommandHandler } from '../commands/DeletePostCommandHandler.ts';
import { UpdatePostCommandHandler } from '../commands/UpdatePostCommandHandler.ts';
import { Empty, KeywordList, Post, PostList, PostRequest, PostResponse, SearchRequest, SocialMediaService, UserRequest } from '../deps.ts';
import { GetPostQueryHandler } from '../queries/GetPostQueryHandler.ts';
import { ListPostQueryHandler } from '../queries/ListPostsQueryHandler.ts';
import { ListTrendingPostsQueryHandler } from '../queries/ListTrendingPostsQueryHandler.ts';
import { SearchPostQueryHandler } from '../queries/SearchPostQueryHandler.ts';
import { getGrpcServer } from '../server.ts';

export class SocialMediaController {
    constructor() {
        this.addService();
    }

    async addService() {
        const grpcServer = await getGrpcServer();
        
        const postProtoPath = new URL("../protos/social_media.proto", import.meta.url);
        const postProtoFile = Deno.readTextFileSync(postProtoPath);

        grpcServer.addService<SocialMediaService>(postProtoFile, {
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
                    return await handler.query(request);
                } catch (error) {
                    throw error;
                }
            },
            ListPost: async (request: Empty): Promise<PostList> => {
                try {
                    const handler = new ListPostQueryHandler();
                    const data = await handler.query(request);
                    return data;
                } catch (error) {
                    throw error;
                }
            },
            ListTrendingPosts: async (_request: Empty): Promise<PostList> => {
                try {
                    const handler = new ListTrendingPostsQueryHandler();
                    return await handler.query(_request);
                } catch (error) {
                    throw error;
                }
            },
            ListTrendingKeywords: async (_request: Empty): Promise<KeywordList> => {
                throw new Error("Function not implemented.");
            },
            RecommendPosts: async (_request: UserRequest): Promise<PostList> => {
                throw new Error("Function not implemented.");
            },
            SearchPost: async (request: SearchRequest): Promise<PostList> => {
                try {
                    const handler = new SearchPostQueryHandler();
                    return await handler.query(request);
                } catch (error) {
                    throw error;
                }
            }
        });
    }
}