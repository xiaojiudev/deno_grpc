// Test
import {
    afterAll,
    beforeAll,
    describe,
    it,
} from "https://deno.land/std@0.224.0/testing/bdd.ts";
import {
    assertObjectMatch,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// Model
import { UserCollection } from "../../models/UserSchema.ts";
import { PostCollection } from "../../models/PostSchema.ts";

// Database
import { closeDBConnection, connectDB } from "../../db/mongodb.ts";
import { closeEsConnection, connectEs } from "../../db/elasticsearch.ts";
import { CreateUserRequest, ObjectIdType, Post, PostResponse, generateObjectId, } from "../../deps.ts";

// Action
import { CreatePostCommandHandler, DeletePostCommandHandler, UpdatePostCommandHandler } from "../../commands/index.ts";
import { GetPostQueryHandler } from "../../queries/index.ts";

// Temporary fix prevent leaks detected when close elasticsearch connection
const sanitizationOptions = {
    sanitizeOps: false,
    sanitizeResources: false,
}

describe("Unit Test - Post service", sanitizationOptions, () => {
    let userId: ObjectIdType | null = null;
    let postId: ObjectIdType | null = null;
    let postData: Post | null = null;
    const createPostCommand: CreatePostCommandHandler = new CreatePostCommandHandler();;
    const updatePostCommand: UpdatePostCommandHandler = new UpdatePostCommandHandler();
    const deletePostCommand: DeletePostCommandHandler = new DeletePostCommandHandler();
    const getPostQuery: GetPostQueryHandler = new GetPostQueryHandler();

    const userInit: CreateUserRequest = {
        username: "user123",
        password: "password123",
    }

    beforeAll(async () => {
        await connectDB();
        await connectEs();
        
        const userDoc = await UserCollection.create({ ...userInit });
        if (userDoc._id) {
            userId = userDoc._id;
        }

    });

    afterAll(async () => {
        if (postId) {
            await PostCollection.deleteOne({ _id: postId })
        }

        if (userId) {
            await UserCollection.deleteOne({ _id: userId });
        }

        await closeDBConnection();
        await closeEsConnection();
    });

    describe("Unit test for save post operation", () => {
        it("givenInvalidUserId_whenSavePost_thenReturnFailedObject", async () => {
            const invalidUserId: string = "123";
            const postSample: Post = {
                userId: invalidUserId,
                title: "Title test",
                content: "Content test",
            }

            const actualRes: PostResponse = await createPostCommand.handle({ ...postSample });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "User ID not valid",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenValidButNotExistUserId_whenSavePost_thenReturnFailedObject", async () => {
            const validUserId: string = generateObjectId().toString();
            const postSample: Post = {
                userId: validUserId,
                title: "Title test",
                content: "Content test",
            }

            const actualRes: PostResponse = await createPostCommand.handle({ ...postSample });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "User not found",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenEmptyTitle_whenSavePost_thenReturnFailedObject", async () => {
            const validUserId: string = generateObjectId().toString();
            const postSample: Post = {
                userId: validUserId,
                title: "",
                content: "Content test",
            }

            const actualRes: PostResponse = await createPostCommand.handle({ ...postSample });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "Title and content are not empty",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenEmptyContent_whenSavePost_thenReturnFailedObject", async () => {
            const validUserId: string = generateObjectId().toString();
            const postSample: Post = {
                userId: validUserId,
                title: "Title test",
                content: "",
            }

            const actualRes: PostResponse = await createPostCommand.handle({ ...postSample });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "Title and content are not empty",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenPostSample_whenSavePost_thenReturnPostObject", async () => {
            if (userId) {
                const postSample: Post = {
                    userId: userId.toString(),
                    title: "Title test",
                    content: "Content test",
                }

                const actualRes: PostResponse = await createPostCommand.handle({ ...postSample });

                if (actualRes.success && actualRes.post && actualRes.post.id) {
                    postId = generateObjectId(actualRes.post.id);
                    postData = {
                        ...postSample,
                        id: postId?.toString(),
                    }
                }

                const expected: Record<string, boolean | string | unknown> = {
                    success: true,
                    message: "Post created successfully",
                    post: postData,
                };

                assertObjectMatch(actualRes, expected);
            }
        });
    });

    describe("Unit test for find post operation", () => {
        it("givenInvalidPostId_whenFindPost_thenReturnFailedObject", async () => {
            const invalidPostId: string = "123";

            const actualRes: PostResponse = await getPostQuery.handle({ id: invalidPostId });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "Invalid ID",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenValidButNotExistPostId_whenFindPost_thenReturnFailedObject", async () => {
            const validPostId: string = generateObjectId().toString();

            const actualRes: PostResponse = await getPostQuery.handle({ id: validPostId });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "Post not found",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenValidPostId_whenFindPost_thenReturnPostObject", async () => {
            if (postId && postData) {
                const validPostId: string = postId.toString();

                const actualRes: PostResponse = await getPostQuery.handle({ id: validPostId });
                const expected: Record<string, boolean | string | unknown> = {
                    success: true,
                    message: "Post found",
                    post: postData
                };

                assertObjectMatch(actualRes, expected);
            }
        });
    });

    describe("Unit test for update post operation", () => {
        it("givenInvalidUserId_whenUpdatePost_thenReturnFailedObject", async () => {
            if (postId) {
                const invalidUserId: string = "123";
                const postUpdate = {
                    id: postId.toString(),
                    userId: invalidUserId,
                    content: "content update",
                    title: "title update",
                }

                const actualRes: PostResponse = await updatePostCommand.handle({ ...postUpdate });
                const expected: Record<string, boolean | string | unknown> = {
                    success: false,
                    message: "User ID not valid",
                };

                assertObjectMatch(actualRes, expected);
            }

        });

        it("givenInvalidPostId_whenUpdatePost_thenReturnFailedObject", async () => {
            if (userId) {
                const invalidPostId: string = "123";
                const postUpdate = {
                    id: invalidPostId,
                    userId: userId.toString(),
                    content: "content update",
                    title: "title update",
                }

                const actualRes: PostResponse = await updatePostCommand.handle({ ...postUpdate });
                const expected: Record<string, boolean | string | unknown> = {
                    success: false,
                    message: "Post Id is invalid",
                };

                assertObjectMatch(actualRes, expected);
            }
        });

        it("givenValidButNotExistPostId_whenDeletePost_thenReturnFailedObject", async () => {
            if (userId) {
                const postId: string = generateObjectId().toString();
                const postUpdate = {
                    id: postId,
                    userId: userId.toString(),
                    content: "content update",
                    title: "title update",
                }

                const actualRes: PostResponse = await updatePostCommand.handle({ ...postUpdate });
                const expected: Record<string, boolean | string | unknown> = {
                    success: false,
                    message: "Post not found",
                };

                assertObjectMatch(actualRes, expected);
            }
        });

        it("givenValidPostId_whenUpdatePost_thenReturnUpdatedPostObject", async () => {
            if (userId && postId && postData) {
                const postUpdate = {
                    id: postId.toString(),
                    userId: userId.toString(),
                    content: "content update",
                    title: "title update",
                }

                const actualRes: PostResponse = await updatePostCommand.handle({ ...postUpdate });
                const expected: Record<string, boolean | string | unknown> = {
                    success: true,
                    message: "Update post successfully",
                    post: postUpdate
                };

                assertObjectMatch(actualRes, expected);
            }
        });
    });

    describe("Unit test for delete post operation", () => {
        it("givenInvalidPostId_whenDeletePost_thenReturnFailedObject", async () => {
            const invalidPostId: string = "123";

            const actualRes: PostResponse = await deletePostCommand.handle({ id: invalidPostId });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "PostId is invalid",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenValidButNotExistPostId_whenDeletePost_thenReturnFailedObject", async () => {
            const validPostId: string = generateObjectId().toString();

            const actualRes: PostResponse = await deletePostCommand.handle({ id: validPostId });
            const expected: Record<string, boolean | string | unknown> = {
                success: false,
                message: "Post not found",
            };

            assertObjectMatch(actualRes, expected);
        });

        it("givenValidPostId_whenDeletePost_thenReturnSuccessObject", async () => {
            if (userId && postId) {
                const actualRes: PostResponse = await deletePostCommand.handle({ id: postId.toString() });
                const expected: Record<string, boolean | string | unknown> = {
                    success: true,
                    message: "Delete post successfully",
                };

                assertObjectMatch(actualRes, expected);
            }
        });
    });
},);
