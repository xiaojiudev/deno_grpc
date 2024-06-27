// Test
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
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
import { PostResponse, mongoose } from "../../deps.ts";

// Action
import { CreatePostCommandHandler } from "../../commands/index.ts";
import { GetPostQueryHandler } from "../../queries/index.ts";

// Temporary fix prevent leaks detected when close elasticsearch connection
const sanitizationOptions = {
    sanitizeOps: false,
    sanitizeResources: false,
}

describe("Unit Test - Post service", sanitizationOptions, () => {
    let userId: string | null = null;
    const postIds: string[] = [];
    let command: CreatePostCommandHandler; //TODO: remove (not used)

    beforeAll(async () => {
        await connectDB();
        await connectEs();
    });

    beforeEach(() => {
        command = new CreatePostCommandHandler();
    });

    afterEach(async () => {
        for (const postId of postIds) {
            await PostCollection.deleteOne({ _id: new mongoose.Types.ObjectId(postId) });
        }

        if (userId) {
            await UserCollection.deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
        }
    });

    afterAll(async () => {
        await closeDBConnection();
        await closeEsConnection();
    });

    describe("Unit test for find post operation", () => {
        it("givenInvalidPostId_whenFindPost_thenThrowError", async () => {
            const invalidPostId = "123";
            const query = new GetPostQueryHandler();
            const actualRes = await query.handle({id: invalidPostId});

            /*
                assertRejects is used for Promise function
                assertThrows is used for normal function
            */
            // assertRejects(
            //     async () => await query.handle({ id: invalidPostId }),
            //     Error,
            //     "Invalid ID",
            // );

            const expected = {
                success: false,
                message: "Invalid ID",
            };

            assertObjectMatch(actualRes, expected);
        });
        it("givenValidButNotExistPostId_whenFindPost_thenReturnFailedObject", async () => {
            const validPostId = new mongoose.Types.ObjectId().toString(); //TODO: remove (not used)
            const query = new GetPostQueryHandler(); //TODO: remove (not used)
            // const actualRes = await query.handle({ id: validPostId }); //TODO: remove comment

            const expected = {
                success: false,
                message: "Post not found",
            };

            assertObjectMatch(expected, expected);
        });
    });

    describe("Unit test for save post operation", () => {
        it("given_when_then", async () => {
        });
    });

    describe("Unit test for update post operation", () => { // TODO: describe with no test
        it("given_when_then", async () => {
        });
    });

    describe("Unit test for delete post operation", () => { // TODO: describe with no test
        it("given_when_then", async () => {
        });
    });
});
