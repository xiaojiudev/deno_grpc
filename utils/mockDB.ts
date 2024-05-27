import { PostSchema, getPostsCollection } from "../model/PostSchema.ts";
import { deleteIndex, getEs } from "../model/es.ts";

const posts: PostSchema[] = [
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
    },
];

export const getMockPostData = async () => {
    const PostCollection = await getPostsCollection();
    const esClient = await getEs();

    const existingPostCount = await PostCollection.countDocuments({});

    if (existingPostCount === 0) {
        const insetId = await PostCollection.insertMany([...posts]);
        console.log(insetId);

        await deleteIndex("posts");
        posts.forEach(async (post, index) => {
            const { _id, ...newPost } = post;
            await esClient.index({
                index: "posts",
                id: insetId.insertedIds[index].toString(),
                document: {
                    id: _id!.toString(),
                    ...newPost
                },
            });
        })

        return { success: !!insetId };
    } else {
        return { success: true };
    }
}