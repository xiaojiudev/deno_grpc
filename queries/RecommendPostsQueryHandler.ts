import { POST_INDEX } from "../constant/index.ts";
import { getEs, queryEs } from "../db/elasticsearch.ts";
import { mongoose } from "../deps.ts";
import { Post } from "../deps.ts";
import { validObjectId } from "../deps.ts";
import { PostList, UserRequest } from "../deps.ts";
import { CategoryCollection } from "../model/CategorySchema.ts";
import { IPost } from "../model/PostSchema.ts";
import { PostCollection } from "../model/PostSchema.ts";
import { UserCollection } from "../model/UserSchema.ts";
import { RequestAgrs, getRecommendationPosts } from "../utils/pythonScript.ts";


export class RecommendPostsQueryHandler {
	async handle(request: UserRequest): Promise<PostList> {
		const userId = request.userId;

		if (!validObjectId(userId)) {
			return { posts: [] };
		}

		const userFavCategories = await UserCollection.findOne({ _id: userId })
			.select("favCategories");

		if (!userFavCategories) {
			console.log("User not found");
			return { posts: [] };
		} else if (userFavCategories?.favCategories?.length === 0) {
			console.log("No fav categories - Random trending posts");
			const postsRes = await this.getRandomTrendingPost();
			return { posts: [...postsRes] }
		} else {
			console.log("Having fav categories - Run collaborative filtering");
			const postsRes = await this.recommendPost(userId);
			return { posts: [...postsRes] }
		}
	}

	private async recommendPost(userId: string): Promise<Post[]> {
		const categoryDocs = await CategoryCollection.find({}).distinct('_id');
		const categoryList = categoryDocs.map((c) => c._id.toString());

		const payload: RequestAgrs = {
			DATASET_PATH: "./dataset/user_fav.data",
			CATEGORY_LIST: categoryList,
			USER_ID: userId,
			RECOMMEND_TOP_N: 5
		}
		const recommendPostsRes = await getRecommendationPosts(payload);

		const categoryIds = recommendPostsRes.map((c) => new mongoose.Types.ObjectId(c));

		const esClient = getEs();
		const aggregationData = await esClient.search({
			index: 'posts',
			size: 10,
			query: {
				bool: {
					filter: {
						terms: { "categories": [...categoryIds] }
					}
				},
			},
			sort: [
				{ "trendingScore": { order: "desc", numeric_type: "double", } },
				{ "createdAt": { order: "desc" } }
			],
		});

		const mappedPosts = aggregationData.hits.hits.map((hit) => {
			const post = hit._source as IPost;
			const tempPost: Post = {
				userId: post.id!.toString(),
				title: post.title,
				content: post.content
			}
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
								}
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
										boost: 10
									},
								}
							},
							weight: 50,
							random_score: {}
						}
					],
					max_boost: 100,
					score_mode: "max",
					boost_mode: "multiply",
					min_score: 42

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
				content: post.content
			}
			return tempPost;
		});

		return [...mappedPosts];


	}
}
