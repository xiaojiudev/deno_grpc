import { POST_INDEX } from "../constant/index.ts";
import { queryEs } from "../db/elasticsearch.ts";
import { ObjectId } from "../deps.ts";
import { PostList, UserRequest } from "../deps.ts";
import { getUsersCollection } from "../model/UserSchema.ts";
import { PostES } from "./GetPostQueryHandler.ts";

export class RecommendPostsQueryHandler {
	async handle(request: UserRequest): Promise<PostList> {
		const userId = request.userId;

		if (!userId || !ObjectId.isValid(userId)) {
			return { posts: [] };
		}

		const UserCollection = await getUsersCollection();
		const user = await UserCollection.findOne({ _id: new ObjectId(userId) });
		if (!user) {
			return { posts: [] };
		}

		const userCategories = user.favoriteCategories;
		// console.log(userCategories);

		const recommendPosts: PostES[] = [];

		for (const category of userCategories) {
			const postsQueryRes = await queryEs({
				index: POST_INDEX,
				size: 10,
				query: {
					match_phrase: {
						categories: category,
					},
				},
				sort: [
					{ "trendingScore": "desc" },
				],
			});
			// console.log(postsQueryRes);

			if (postsQueryRes) {
				postsQueryRes.forEach((item) => {
					const postData = item._source as PostES;

					recommendPosts.push({ ...postData });
				});
			}
		}

		// console.log(recommendPosts);

		const map = new Map<string, number>();

		for (const post of recommendPosts) {
			const postId = post.id;
			map.set(postId, (map.get(postId) ?? 0) + 1);
		}

		const top10PostIds = Array.from(map.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([postId]) => postId);

		const top10Posts: PostES[] = [];

		for (const postId of top10PostIds) {
			const postQueryRes = await queryEs({
				index: POST_INDEX,
				size: 1,
				query: {
					term: { _id: postId },
				},
			});
			if (postQueryRes && postQueryRes.length > 0) {
				const postData = postQueryRes[0]._source as PostES;
				top10Posts.push(postData);
			}
		}

		top10Posts.sort((a, b) => b.trendingScore! - a.trendingScore!);

		console.log(top10PostIds);

		return { posts: [...top10Posts] };
	}
}
