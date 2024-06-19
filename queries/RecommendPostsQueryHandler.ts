import { getEs } from "../db/elasticsearch.ts";
import { mongoose } from "../deps.ts";
import { Post } from "../deps.ts";
import { validObjectId } from "../deps.ts";
import { PostList, UserRequest } from "../deps.ts";
import { CategoryCollection } from "../model/CategorySchema.ts";
import { IPost } from "../model/PostSchema.ts";
import { PostCollection } from "../model/PostSchema.ts";
import { RequestAgrs, getRecommendationPosts } from "../utils/pythonScript.ts";


export class RecommendPostsQueryHandler {
	async handle(request: UserRequest): Promise<PostList> {
		const userId = request.userId;

		if (!validObjectId(userId)) {
			return { posts: [] };
		}

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

		const esClient = await getEs();
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

		console.log("Aggregation data", aggregationData);
		const mappedPosts = aggregationData.hits.hits.map((hit) => {
			const post = hit._source as IPost;
			const tempPost: Post = {
				userId: post.id!.toString(),
				title: post.title,
				content: post.content
			}
			return tempPost;
		});

		// const postDocs = await PostCollection.find({}, {
		// 	_id: 1, user: 1,
		// 	title: 1,
		// 	content: 1,
		// 	trendingScore: 1,
		// })
		// 	.where("categories")
		// 	.in(categoryIds)
		// 	.limit(10)
		// 	.sort([["trendingScore", -1]])
		// 	.exec();

		// const mappedPosts = postDocs.map(doc => {
		// 	const tempPost: Post = {
		// 		userId: doc._id.toString(),
		// 		title: doc.title,
		// 		content: doc.content
		// 	}
		// 	return tempPost;
		// });

		return { posts: [...mappedPosts] };
	}
}
