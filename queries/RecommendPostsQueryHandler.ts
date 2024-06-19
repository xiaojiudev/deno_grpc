import { POST_INDEX } from "../constant/index.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { ObjectId, mongoose } from "../deps.ts";
import { Post } from "../deps.ts";
import { PostList, UserRequest } from "../deps.ts";
import { CategoryCollection } from "../model/CategorySchema.ts";
import { PostCollection } from "../model/PostSchema.ts";
import { UserCollection } from "../model/UserSchema.ts";
import { RequestAgrs, getRecommendationPosts } from "../utils/pythonScript.ts";


export class RecommendPostsQueryHandler {
	async handle(request: UserRequest): Promise<PostList> {
		const userId = request.userId;

		const categoryDocs = await CategoryCollection.find({}).distinct('_id');
		const CATEGORY_LIST = categoryDocs.map((c) => c._id.toString());

		const payload: RequestAgrs = {
			DATASET_PATH: "./user_fav.data",
			CATEGORY_LIST: CATEGORY_LIST,
			USER_ID: userId,
			RECOMMEND_TOP_N: 5
		}
		const res = await getRecommendationPosts(payload);

		console.log(res);
		const cateIds = res.map((c) => new mongoose.Types.ObjectId(c));

		const test = await PostCollection.find({}, {
			_id: 1,
			user: 1,
			title: 1,
			content: 1,
			trendingScore: 1,
		})
			.where("categories")
			.in(cateIds)
			.sort([["trendingScore", -1]])
			.exec();

		console.log(test);

		const postRes = test.map(t => {
			const temp: Post = {
				userId: t._id.toString(),
				title: t.title,
				content: t.content
			}
			return temp;
		});

		return { posts: [...postRes] };
	}
}
