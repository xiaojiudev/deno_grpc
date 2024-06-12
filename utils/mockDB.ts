import { ObjectIdType, mongoose } from "../deps.ts";
import { getEs } from "../db/elasticsearch.ts";
import { IUser, UserCollection } from "../model/UserSchema.ts";
import { IPost, PostCollection } from "../model/PostSchema.ts";
import { POST_INDEX, QUERY_INDEX } from "../constant/index.ts";

const users: IUser[] = [
    {
        username: "xiaojiu123",
        password: "admin123"
    },
    {
        username: "lyphat99",
        password: "admin123"
    },
    {
        username: "username3",
        password: "admin123"
    }
];

const samplePosts: IPost[] = [
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
        createdAt: new Date(Date.now() - (0.5 * 60 * 60 * 1000)), // 30 minutes ago
        updatedAt: new Date(Date.now() - (0.5 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
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
        createdAt: new Date(Date.now() - (48 * 60 * 60 * 1000)), // 2 days ago
        updatedAt: new Date(Date.now() - (48 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
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
        createdAt: new Date(Date.now() - (72 * 60 * 60 * 1000)), // 3 days ago
        updatedAt: new Date(Date.now() - (72 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
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
        createdAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 1 week ago
        updatedAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
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
        createdAt: new Date(Date.now() - (3 * 30 * 24 * 60 * 60 * 1000)), // 3 month ago
        updatedAt: new Date(Date.now() - (3 * 30 * 24 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
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
        createdAt: new Date(Date.now() - (24 * 60 * 60 * 1000)), // 1 day ago
        updatedAt: new Date(Date.now() - (24 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
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
        createdAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
        updatedAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
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
        createdAt: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years ago
        updatedAt: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)),
        user: new mongoose.Types.ObjectId(),
    },
];

export const getMockPostData = async (): Promise<{ success: boolean }> => {
    const esClient = await getEs();

    const existingUserCount = await UserCollection.countDocuments({});
    const existingPostCount = await PostCollection.countDocuments({});

    const userIdArr: ObjectIdType[] = [];

    if (existingUserCount === 0) {
        const userDocs = await UserCollection.insertMany([...users]);
        userDocs.forEach((user) => userIdArr.push(user._id));
    } else {
        const users = await UserCollection.find({});
        users.forEach((user) => userIdArr.push(user._id!));
    }

    const existIndex = await esClient.indices.exists({ index: POST_INDEX });
    if (existIndex) {
        const postEsCount = await esClient.count({ index: POST_INDEX });
        if (existingPostCount !== postEsCount.count) {
            await clearAllMocks();
        }
    }

    if (existingPostCount === 0) {
        const postData: IPost[] = samplePosts.map((post) => {
            return {
                ...post,
                user: userIdArr[Math.floor(Math.random() * userIdArr.length)],
            };
        });

        const postDocs = await PostCollection.insertMany([...postData], { includeResultMetadata: true });

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
            console.log("Mock Data to MongoDB or Elasticsearch failed! Nothing to insert!");
            console.log(`MONGODB_POST_CREATE: ${MONGO_POST_CREATE}`);
            console.log(`ES_POST_CREATE: ${ES_POST_CREATE}`);
            return { success: false };
        }
        console.log("Mock data to MongoDB & Elasticsearch successfully!");
        return { success: MONGO_POST_CREATE && ES_POST_CREATE };
    } else {
        console.log("Mock data have already been mocked!");
        return { success: true };
    }

}

const clearAllMocks = async () => {
    const esClient = await getEs();
    await PostCollection.deleteMany({});
    await esClient.deleteByQuery({ index: POST_INDEX, query: { match_all: {} } });
    await esClient.deleteByQuery({ index: QUERY_INDEX, query: { match_all: {} } });
    console.log("Clear all mock data");
}