// Test
import {
	assertObjectMatch,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	it,
} from "https://deno.land/std@0.224.0/testing/bdd.ts";

// Model
import { UserCollection } from "../../models/UserSchema.ts";

// Database
import { CreateUserResponse, mongoose } from "../../deps.ts";
import { closeDBConnection, connectDB } from "../../db/mongodb.ts";

// Action
import { CreateUserRequest } from "../../deps.ts";
import { CreateUserCommandHandler } from "../../commands/index.ts";

describe("Unit Test - User service", () => {
	const userIds: string[] = [];
	let command: CreateUserCommandHandler;

	beforeAll(async () => {
		await connectDB();
	});

	beforeEach(() => {
		command = new CreateUserCommandHandler();
	});

	afterEach(async () => {
		for (const userId of userIds) {
			await UserCollection.deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
		}
	});

	afterAll(async () => {
		await closeDBConnection();
	});

	describe("Unit test for create user operation", () => {
		it("givenEmptyRequest_whenCreateUser_thenReturnFailedObject", async () => {
			const request = {} as CreateUserRequest;
			const actualRes: CreateUserResponse = await command.handle(request);

			const expected: Record<string, boolean | string | unknown> = {
				success: false,
				message: "Check your fields are valid before continuing",
			};

			assertObjectMatch(actualRes, expected);
		});

		it("givenInvalidUsername_whenCreateUser_thenReturnFailedObject", async () => {
			const request: CreateUserRequest = {
				username: "1",
				password: "password",
			};
			const actualRes: CreateUserResponse = await command.handle(request);

			const expected: Record<string, boolean | string | unknown> = {
				success: false,
				message: "Username required 6-16 characters, only letters and numbers are allowed",
			};
			assertObjectMatch(actualRes, expected);
		});

		it("givenInvalidPassword_whenCreateUser_thenReturnFailedObject", async () => {
			const request: CreateUserRequest = {
				username: "username",
				password: "123",
			};
			const actualRes: CreateUserResponse = await command.handle(request);

			const expected: Record<string, boolean | string | unknown> = {
				success: false,
				message:
					"Password required minimum eight characters, at least one letter and one number",
			};
			assertObjectMatch(actualRes, expected);
		});

		it("givenExistingUsername_whenCreateUser_thenReturnFailedObject", async () => {
			const request: CreateUserRequest = {
				username: "username",
				password: "password123",
			};

			await command.handle(request);
			const savedUser2: CreateUserResponse = await command.handle(request);

			const expected: Record<string, boolean | string | unknown> = {
				success: false,
				message: "User already exist!",
			};

			assertObjectMatch(savedUser2, expected);

			const savedUserDoc = await UserCollection.findOne({ username: request.username })
				.exec();

			if (savedUserDoc) {
				userIds.push(savedUserDoc.getId());
			}
		});

		it("givenUserRequest_whenCreateUser_thenCreatedUser", async () => {
			const request: CreateUserRequest = {
				username: "username",
				password: "password123",
			};

			const actualRes: CreateUserResponse = await command.handle(request);

			const expected: Record<string, boolean | string | unknown> = {
				success: true,
				message: "User created successfully",
			};

			assertObjectMatch(actualRes, expected);

			const userDoc = await UserCollection.findOne({ username: request.username });

			if (userDoc) {
				userIds.push(userDoc.getId());
			}
		});
	});
});
