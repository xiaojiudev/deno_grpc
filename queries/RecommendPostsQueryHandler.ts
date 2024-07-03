import { POST_INDEX } from "../constant/index.ts";
import { getEs, queryEs } from "../db/elasticsearch.ts";
import { generateObjectId } from "../deps.ts";
import { Post } from "../deps.ts";
import { validObjectId } from "../deps.ts";
import { PostList, UserRequest } from "../deps.ts";
import { CategoryCollection } from "../models/CategorySchema.ts";
import { IPost } from "../models/PostSchema.ts";
import { UserCollection } from "../models/UserSchema.ts";
import { RequestAgrs, runCollaborativeFiltering } from "../utils/pythonScript.ts";

export class RecommendPostsQueryHandler {
	async handle(request: UserRequest): Promise<PostList> {
		const userId = request.userId;

		if (!validObjectId(userId)) {
			return { posts: [] };
		}

		const userFavCategories = await UserCollection.findOne({ _id: userId })
			.select("favCategories");

		if (!userFavCategories) {
			console.log("⚠️  User not found");
			return { posts: [] };
		} else if (userFavCategories?.favCategories?.length === 0) {
			console.log("ℹ️  No fav categories - Random trending posts");
			const postsRes = await this.getRandomTrendingPost();
			return { posts: [...postsRes] };
		} else {
			console.log("ℹ️  Having fav categories - Run collaborative filtering");
			const postsRes = await this.recommendPost(userId);
			return { posts: [...postsRes] };
		}
	}

	private async recommendPost(userId: string): Promise<Post[]> {
		const POST_DATASET_PATH = "../dataset/user_fav.data";
		const categoryDocs = await CategoryCollection.find({}).distinct("_id");
		const categoryList = categoryDocs.map((c) => c.toString());

		const payload: RequestAgrs = {
			DATASET_PATH: POST_DATASET_PATH,
			CATEGORY_LIST: categoryList,
			USER_ID: userId,
			RECOMMEND_TOP_N: 5,
		};

		const recommendPostsRes = await runCollaborativeFiltering(payload);
		const categoryIds = recommendPostsRes.map((c) => generateObjectId(c));

		const esClient = getEs();
		const aggregationData = await esClient.search({
			index: POST_INDEX,
			size: 10,
			query: {
				bool: {
					filter: {
						terms: { "categories": [...categoryIds] },
					},
				},
			},
			sort: [
				{ "trendingScore": { order: "desc", numeric_type: "double" } },
				{ "createdAt": { order: "desc" } },
			],
		});

		const mappedPosts = aggregationData.hits.hits.map((hit) => {
			const post = hit._source as IPost;
			const tempPost: Post = {
				userId: post.id!.toString(),
				title: post.title,
				content: post.content,
			};
			return tempPost;
		});

		return mappedPosts;
	}

	private async getRandomTrendingPost(): Promise<Post[]> {
		const randomTrendingPosts = await queryEs({
			index: POST_INDEX,
			query: {
				function_score: {
					query: { match_all: {} },
					boost: 5,
					functions: [
						{
							filter: {
								range: {
									"createdAt": {
										gte: "now-7d/d",
										lte: "now/d",
									},
								},
							},
							weight: 30,
							random_score: {},
						},
						{
							filter: {
								range: {
									"trendingScore": {
										gte: 0.6,
										lte: 1,
										boost: 10,
									},
								},
							},
							weight: 50,
							random_score: {},
						},
					],
					max_boost: 100,
					score_mode: "max",
					boost_mode: "multiply",
					min_score: 42,
				},
			},
			from: 0,
			size: 5,
		});
		const mappedPosts = randomTrendingPosts!.map((hit) => {
			const post = hit._source as IPost;
			const tempPost: Post = {
				userId: post.id!.toString(),
				title: post.title,
				content: post.content,
			};
			return tempPost;
		});

		return [...mappedPosts];
	}
}
