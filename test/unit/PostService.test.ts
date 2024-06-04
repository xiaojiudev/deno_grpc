import { CreatePostCommandHandler } from "../../commands/CreatePostCommandHandler.ts";
import { DeletePostCommandHandler } from "../../commands/DeletePostCommandHandler.ts";
import { connectEs } from "../../db/elasticsearch.ts";
import { connectDB } from "../../db/mongodb.ts";
import { afterEach, assertObjectMatch, describe, it, ObjectId, Post, PostRequest, UserInteraction } from "../../deps.ts";
import { getPostsCollection } from "../../model/PostSchema.ts";
import { getUsersCollection, UserInteractionSchema } from "../../model/UserSchema.ts";

await connectDB();
await connectEs();
const UserCollection = await getUsersCollection();
const PostCollection = await getPostsCollection();

describe("Unit Test - Post service", () => {
    let userId: string | null = null;
    const postIds: string[] = [];

    afterEach(async () => {
        postIds.forEach(async (id) => {
            await PostCollection.delete({ _id: new ObjectId(id) });
        });

        if (userId) {
            await UserCollection.delete({ _id: new ObjectId(userId) });
        }
    });

    describe("Create Post", () => {
        it("should return an object of error if userId not valid", async () => {
            const command = new CreatePostCommandHandler();
            const request: Post = {
                userId: "123",
                title: "Test Title",
                content: "Test content",
                categories: [],
                interactions: {},
                trendingScore: 0,
            };

            const actualRes = await command.handle(request);

            const expected = {
                success: false,
                message: "User ID not valid",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("should return an object of error if title or content is empty", async () => {
            const command = new CreatePostCommandHandler();
            const request: Post = {
                userId: new ObjectId().toString(),
                title: "",
                content: "",
                categories: [],
                interactions: {},
                trendingScore: 0,
            };

            const actualRes = await command.handle(request);

            const expected = {
                success: false,
                message: "Title and content are not empty",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("should return an object of error if userId not found", async () => {
            const command = new CreatePostCommandHandler();
            const request: Post = {
                userId: new ObjectId().toString(),
                title: "Test title",
                content: "Test content",
                categories: [],
                interactions: {},
                trendingScore: 0,
            };

            const actualRes = await command.handle(request);

            const expected = {
                success: false,
                message: "User not found",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("should add a post to MongoDB and Elasticsearch", async () => {
            const userInsertedId = await UserCollection.insertOne({
                username: "username1", password: "password123",
                favoriteCategories: [],
                interactions: {} as UserInteractionSchema,
            });

            if (userInsertedId) {
                userId = userInsertedId.toString();

                const command = new CreatePostCommandHandler();
                const request: Post = {
                    userId: userId,
                    title: "Test title",
                    content: "Test content",
                    categories: [],
                    interactions: {},
                    trendingScore: 0,
                };

                const actualRes = await command.handle(request);

                const expected = {
                    success: true,
                    message: "Post created successfully",
                };

                assertObjectMatch(actualRes, expected);
            }

        });
    });

    describe("Update Post", () => {

    });

    describe("Delete Post", () => {
        it("should return an object of error if postId is not valid", async () => {
            const request: PostRequest = { _id: "123" };
            const command = new DeletePostCommandHandler();
            const actualRes = await command.handle(request);

            const expected = {
                success: false,
                message: "Post Id is invalid",
            };
            assertObjectMatch(actualRes, expected);
        })

        it("should return an object of error if postId is not found", async () => {
            const request: PostRequest = { _id: new ObjectId().toString() };
            const command = new DeletePostCommandHandler();
            const actualRes = await command.handle(request);

            const expected = {
                success: false,
                message: "Post not found",
            };
            assertObjectMatch(actualRes, expected);
        })

        it("should delete a post from MongoDB and Elasticsearch", async () => {
            
        })
    });
});
