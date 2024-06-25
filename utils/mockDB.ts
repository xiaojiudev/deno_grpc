import { bcrypt, mongoose, ObjectIdType } from "../deps.ts";
import { createEsIndex, getEs } from "../db/elasticsearch.ts"; //TODO: createESIndex (import but not used)
import { IUser, UserCollection } from "../models/UserSchema.ts";//TODO: error import
import { IPost, PostCollection } from "../models/PostSchema.ts";//TODO: error import
import { POST_INDEX, QUERY_INDEX } from "../constant/index.ts";
import { CategoryCollection, ICategory } from "../models/CategorySchema.ts";//TODO: error import

const userIdArr: ObjectIdType[] = [];
const categoryArr: ICategory[] = [];
const salt = await bcrypt.genSalt(8);
const pwHash = await bcrypt.hash("admin123", salt);

//TODO: the initial elasticsearch init does not have an index, therefore it cannot insert

const users: IUser[] = [
	{
		username: "xiaojiu123",
		password: pwHash,
	},
	{
		username: "lyphat99",
		password: pwHash,
	},
	{
		username: "username3",
		password: pwHash,
	},
];

const categories = [
	{
		name: "Category A"
	},
	{
		name: "Category B"
	},
	{
		name: "Category C"
	},
	{
		name: "Category D"
	},
	{
		name: "Category E"
	},
	{
		name: "Category F"
	},
	{
		name: "Category G"
	},
	{
		name: "Category H"
	},
	{
		name: "Category I"
	},
];

const samplePosts: IPost[] = [
	{
		title: "Post 1",
		content: "Content for Post 1",
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
		createdAt: new Date(Date.now() - (0.5 * 60 * 60 * 1000)), // 30 minutes ago
		updatedAt: new Date(Date.now() - (0.5 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
	{
		title: "Post 2",
		content: "Content for Post 2",
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
		createdAt: new Date(Date.now() - (48 * 60 * 60 * 1000)), // 2 days ago
		updatedAt: new Date(Date.now() - (48 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
	{
		title: "Post 3",
		content: "Content for Post 3",
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
		createdAt: new Date(Date.now() - (72 * 60 * 60 * 1000)), // 3 days ago
		updatedAt: new Date(Date.now() - (72 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
	{
		title: "Post 4",
		content: "Content for Post 4",
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
		createdAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 1 week ago
		updatedAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
	{
		title: "Post 5",
		content: "Content for Post 5",
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
		createdAt: new Date(Date.now() - (3 * 30 * 24 * 60 * 60 * 1000)), // 3 month ago
		updatedAt: new Date(Date.now() - (3 * 30 * 24 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
	{
		title: "Post 6",
		content: "Content for Post 6",
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
		createdAt: new Date(Date.now() - (24 * 60 * 60 * 1000)), // 1 day ago
		updatedAt: new Date(Date.now() - (24 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
	{
		title: "Post 7",
		content: "Content for Post 7",
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
		createdAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
		updatedAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
	{
		title: "Post 8",
		content: "Content for Post 8",
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
		createdAt: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years ago
		updatedAt: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)),
		user: new mongoose.Types.ObjectId(),
	},
];

export const getMockPostData = async () => {
	try {
		await clearAllMocks();
		await mockUserData();
		await mockCategoryData();
		await mockPostData();
	} catch (error) {
		await clearAllMocks();
		console.log("Mock data ERROR");
		throw error;
	}
};

const mockUserData = async () => {
	const existingUserCount = await UserCollection.countDocuments({});

	if (existingUserCount === 0) {
		const userDocs = await UserCollection.insertMany([...users]);
		userDocs.forEach((user) => userIdArr.push(user._id));
		console.log("Mocked user's data successfully");
	} else {
		const users = await UserCollection.find({});
		users.forEach((user) => userIdArr.push(user._id!));
		console.log("User's data has already mocked");
	}
}

const mockCategoryData = async () => {
	const existingCateCount = await CategoryCollection.countDocuments({});

	if (existingCateCount === 0) {
		const completeCategories = categories.map((category) => {
			const numOfItems = Math.floor(Math.random() * userIdArr.length);
			const userArr = userIdArr
				.sort(() => Math.random() - Math.random())
				.slice(0, numOfItems);

			return {
				...category,
				users: [...userArr]
			}
		});

		const cateDocs = await CategoryCollection.insertMany([...completeCategories]);
		cateDocs.forEach((cate) => categoryArr.push(cate.toClient()));
		console.log("Mocked cate's data successfully");
	} else {
		const categories = await CategoryCollection.find({});
		categories.forEach((cate) => categoryArr.push(cate.toClient()));
		console.log("Cate's data has already mocked");
	}

}

const mockPostData = async () => {
	const esClient = getEs();
	const existingPostCount = await PostCollection.countDocuments({});

	if (existingPostCount === 0) {
		const postData: IPost[] = samplePosts.map((post) => {
			const numOfItems = Math.floor(Math.random() * categoryArr.length);
			const cateIdArr = categoryArr
				.sort(() => Math.random() - Math.random())
				.slice(0, numOfItems)
				.filter(c => c && c?.id)
				.map(c => c.id!)

			return {
				...post,
				user: userIdArr[Math.floor(Math.random() * userIdArr.length)],
				categories: [...cateIdArr],
			};
		});

		const postDocs = await PostCollection.insertMany([...postData], {
			includeResultMetadata: true,
		});

		const MONGO_POST_CREATE = !!postDocs;
		let ES_POST_CREATE = true;

		samplePosts.forEach(async (post, index) => {
			const { id, ...remainData } = post;
			const res = await esClient.index({
				index: POST_INDEX,
				id: postDocs[index]._id.toString(),
				document: {
					...remainData,
					trendingScore: postDocs[index]?.trendingScore,
					id: postDocs[index]._id.toString(),
					user: postDocs[index].user.toString(),
				},
			});

			if (res.result !== "created") {
				ES_POST_CREATE = false;
			}
		});

		if (!MONGO_POST_CREATE || !ES_POST_CREATE) {
			await clearAllMocks();
			console.log(
				"Mock Data to MongoDB or Elasticsearch failed! Nothing to insert!",
			);
			console.log(`MONGODB_POST_CREATE: ${MONGO_POST_CREATE}`);
			console.log(`ES_POST_CREATE: ${ES_POST_CREATE}`);
			return { success: false };
		}
		console.log("Mock post's data successfully!");
		return { success: MONGO_POST_CREATE && ES_POST_CREATE };
	} else {
		console.log("Post's data has already mocked!");
		return { success: true };
	}
}

const clearAllMocks = async () => {
	const esClient = getEs();
	await Promise.all([
		UserCollection.deleteMany({}),
		CategoryCollection.deleteMany({}),
		PostCollection.deleteMany({}),
	]);

	await Promise.all([
		esClient.deleteByQuery({
			index: POST_INDEX,
			query: { match_all: {} },
		}),
		esClient.deleteByQuery({
			index: QUERY_INDEX,
			query: { match_all: {} },
		}),
	]);
	
	console.log("Clear all mock data");
};
