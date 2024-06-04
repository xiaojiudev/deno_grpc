import { CreatePostCommandHandler } from "../commands/CreatePostCommandHandler.ts";
import { DeletePostCommandHandler } from "../commands/DeletePostCommandHandler.ts";
import { UpdatePostCommandHandler } from "../commands/UpdatePostCommandHandler.ts";
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
import { GetPostQueryHandler } from "../queries/GetPostQueryHandler.ts";
import { GetPostsQueryHandler } from "../queries/GetPostsQueryHandler.ts";
import { GetTrendingPostsQueryHandler } from "../queries/GetTrendingPostsQueryHandler.ts";
import { SearchPostQueryHandler } from "../queries/SearchPostQueryHandler.ts";
import { getGrpcServer } from "../db/grpc.ts";
import { UpdateKeywordSearchCountHandler } from "../commands/UpdateKeywordSearchCountHandler.ts";
import { RecommendPostsQueryHandler } from "../queries/RecommendPostsQueryHandler.ts";
import { GetTopKeywordQueryHandler } from "../queries/GetTopKeywordQueryHandler.ts";

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
		ListPost: async (request: Empty): Promise<PostList> => {
			try {
				const queries = new GetPostsQueryHandler();
				const data = await queries.handle(request);
				return data;
			} catch (error) {
				throw error;
			}
		},
		ListTrendingPosts: async (_request: Empty): Promise<PostList> => {
			try {
				const queries = new GetTrendingPostsQueryHandler();
				return await queries.handle(_request);
			} catch (error) {
				throw error;
			}
		},
		ListTrendingKeywords: async (request: Empty): Promise<KeywordList> => {
			try {
				const queries = new GetTopKeywordQueryHandler();
				return await queries.handle(request);
			} catch (error) {
				throw error;
			}
		},
		RecommendPosts: async (request: UserRequest): Promise<PostList> => {
			try {
				const queries = new RecommendPostsQueryHandler();
				return await queries.handle(request);
			} catch (error) {
				throw error;
			}
		},
		SearchPost: async (request: SearchRequest): Promise<PostList> => {
			try {
				const command = new UpdateKeywordSearchCountHandler();
				command.handle(request);
				const queries = new SearchPostQueryHandler();
				return await queries.handle(request);
				// return { posts: [] };
			} catch (error) {
				throw error;
			}
		},
	});
};
