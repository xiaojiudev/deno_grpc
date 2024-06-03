import { getPostsCollection, PostSchema } from "../model/PostSchema.ts";
import { deleteIndex, getEs } from "../db/elasticsearch.ts";
import { getUsersCollection, UserSchema } from "../model/UserSchema.ts";
import { ObjectId } from "../deps.ts";

const users: UserSchema[] = [
	{
		username: "xiaojiu123",
		password: "abcdef123",
		favoriteCategories: ["Category A", "Category B", "Category C", "Category D", "Category E"],
		interactions: {
			likedPosts: [],
			bookmarkedPosts: [],
			clickedPosts: [],
		},
	},
	{
		username: "lyphat99",
		password: "abcdef123",
		favoriteCategories: ["Category B"],
		interactions: {
			likedPosts: [],
			bookmarkedPosts: [],
			clickedPosts: [],
		},
	},
	{
		username: "username3",
		password: "abcdef123",
		favoriteCategories: ["Category C"],
		interactions: {
			likedPosts: [],
			bookmarkedPosts: [],
			clickedPosts: [],
		},
	},
];

const samplePosts: PostSchema[] = [
	{
		title: "Post 1",
		content: "Content for Post 1",
		categories: ["Category A", "Category B"],
		interactions: {
			likes: 146,
			comments: 0,
			shares: 3,
			clicked: 100,
			profileClicked: 20,
			bookmarked: 0,
			photoExpanded: 120,
			videoPlayback: 0,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (0.5 * 60 * 60 * 1000)), // 30 minutes ago
		updatedAt: new Date(Date.now() - (0.5 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
	{
		title: "Post 2",
		content: "Content for Post 2",
		categories: ["Category C"],
		interactions: {
			likes: 1000,
			comments: 50,
			shares: 100,
			clicked: 200,
			profileClicked: 20,
			bookmarked: 10,
			photoExpanded: 5,
			videoPlayback: 0,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (48 * 60 * 60 * 1000)), // 2 days ago
		updatedAt: new Date(Date.now() - (48 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
	{
		title: "Post 3",
		content: "Content for Post 3",
		categories: ["Category A", "Category D"],
		interactions: {
			likes: 500,
			comments: 10,
			shares: 5,
			clicked: 1000,
			profileClicked: 1,
			bookmarked: 2,
			photoExpanded: 0,
			videoPlayback: 10000,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (72 * 60 * 60 * 1000)), // 3 days ago
		updatedAt: new Date(Date.now() - (72 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
	{
		title: "Post 4",
		content: "Content for Post 4",
		categories: ["Category B", "Category D"],
		interactions: {
			likes: 2000,
			comments: 200,
			shares: 500,
			clicked: 1000,
			profileClicked: 100,
			bookmarked: 50,
			photoExpanded: 0,
			videoPlayback: 2856,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 1 week ago
		updatedAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
	{
		title: "Post 5",
		content: "Content for Post 5",
		categories: ["Category C", "Category D"],
		interactions: {
			likes: 11253,
			comments: 253,
			shares: 352,
			clicked: 200,
			profileClicked: 500,
			bookmarked: 20,
			photoExpanded: 5862,
			videoPlayback: 0,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (3 * 30 * 24 * 60 * 60 * 1000)), // 3 month ago
		updatedAt: new Date(Date.now() - (3 * 30 * 24 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
	{
		title: "Post 6",
		content: "Content for Post 6",
		categories: ["Category C", "Category D"],
		interactions: {
			likes: 5640,
			comments: 95,
			shares: 288,
			clicked: 2500,
			profileClicked: 1000,
			bookmarked: 0,
			photoExpanded: 0,
			videoPlayback: 0,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (24 * 60 * 60 * 1000)), // 1 day ago
		updatedAt: new Date(Date.now() - (24 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
	{
		title: "Post 7",
		content: "Content for Post 7",
		categories: ["Category C", "Category D"],
		interactions: {
			likes: 5280,
			comments: 308,
			shares: 165,
			clicked: 2500,
			profileClicked: 1000,
			bookmarked: 0,
			photoExpanded: 0,
			videoPlayback: 0,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
		updatedAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
	{
		title: "Post 8",
		content: "Content for Post 8",
		categories: ["Category E", "Category A"],
		interactions: {
			likes: 17000,
			comments: 1400,
			shares: 612,
			clicked: 17896,
			profileClicked: 2586,
			bookmarked: 252,
			photoExpanded: 17896,
			videoPlayback: 0,
		},
		trendingScore: 0.0,
		createdAt: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years ago
		updatedAt: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)),
		userId: new ObjectId(),
		_id: new ObjectId(),
	},
];

export const getMockPostData = async (): Promise<{ success: boolean }> => {
	const PostCollection = await getPostsCollection();
	const UserCollection = await getUsersCollection();
	const esClient = await getEs();

	const existingUserCount = await UserCollection.countDocuments({});
	const existingPostCount = await PostCollection.countDocuments({});

	let userIdArr: ObjectId[] = [];

	if (existingUserCount === 0) {
		const insertRes = await UserCollection.insertMany([...users]);
		insertRes.insertedIds.forEach((insertId) => userIdArr.push(insertId));
		console.log(insertRes);
	} else {
		const users = await UserCollection.find({}).toArray();
		users.forEach((user) => userIdArr.push(user._id!));
	}

	if (existingPostCount === 0) {
		const postData = samplePosts.map((post) => {
			return {
				...post,
				userId: userIdArr[Math.floor(Math.random() * userIdArr.length)],
			};
		});

		const insertRes = await PostCollection.insertMany([...postData]);
		console.log(insertRes);

		await deleteIndex("posts");
		postData.forEach(async (post, index) => {
			const { _id, ...newPost } = post;
			await esClient.index({
				index: "posts",
				id: insertRes.insertedIds[index].toString(),
				document: {
					id: _id!.toString(),
					...newPost,
				},
			});
		});

		return { success: !!insertRes };
	} else {
		return { success: true };
	}
};
