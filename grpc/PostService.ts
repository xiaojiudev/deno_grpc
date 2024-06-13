import { getGrpcServer } from "./grpc.ts";
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
import {
	CreatePostCommandHandler,
	CreateQueryCommandHandler,
	DeletePostCommandHandler,
	UpdatePostCommandHandler,
} from "../commands/index.ts";
import {
	GetPostQueryHandler,
	GetPostsQueryHandler,
	GetTopKeywordQueryHandler,
	GetTrendingPostsQueryHandler,
	SearchPostQueryHandler,
} from "../queries/index.ts";

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
			try {
				const command = new CreateQueryCommandHandler();
				command.handle(request);
				const queries = new SearchPostQueryHandler();
				return await queries.handle(request);
			} catch (error) {
				throw error;
			}
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
			try {
				const queries = new GetTopKeywordQueryHandler();
				return await queries.handle(request);
			} catch (error) {
				throw error;
			}
		},
		RecommendPosts: async (request: UserRequest): Promise<PostList> => {
			throw new Error("Function not implemented.");
		},
	});
};
