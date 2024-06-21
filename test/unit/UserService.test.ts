import {
	assertEquals,
	assertObjectMatch,
	assertStrictEquals,
	assertThrows,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,	
	it,
} from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { CreateUserCommandHandler } from "../../commands/index.ts";
import { UserCollection } from "../../model/UserSchema.ts";
import { mongoose } from "../../deps.ts";
import { CreateUserRequest } from "../../deps.ts";
import { connectDB } from "../../db/mongodb.ts";

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
		await mongoose.connection.close();
	});

	describe("Unit test for save user operation", () => {
		it("givenEmptyRequest_whenSaveUser_thenReturnFailedObject", async () => {
			const request = {} as CreateUserRequest;
			const actualRes = await command.handle(request);

			const expected = {
				success: false,
				message: "Check your fields are valid before continuing",
			};
			assertObjectMatch(actualRes, expected);
		});

		it("givenInvalidUsername_whenSaveUser_thenReturnFailedObject", async () => {
			const request: CreateUserRequest = {
				username: "1",
				password: "password",
			};
			const actualRes = await command.handle(request);

			const expected = {
				success: false,
				message: "Username required 6-16 characters, only letters and numbers are allowed",
			};
			assertObjectMatch(actualRes, expected);
		});

		it("givenInvalidPassword_whenSaveUser_thenReturnFailedObject", async () => {
			const request: CreateUserRequest = {
				username: "username",
				password: "123",
			};
			const actualRes = await command.handle(request);

			const expected = {
				success: false,
				message:
					"Password required minimum eight characters, at least one letter and one number",
			};
			assertObjectMatch(actualRes, expected);
		});

		it("givenExistingUsername_whenSaveUser_thenReturnFailedObject", async () => {
			const request: CreateUserRequest = {
				username: "username",
				password: "password123",
			};

			const savedUser1 = await command.handle(request);
			const savedUser2 = await command.handle(request);

			const expected = {
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

		it("givenUserRequest_whenSaveUser_thenSavedUser", async () => {
			const request: CreateUserRequest = {
				username: "username",
				password: "password123",
			};

			const actualRes = await command.handle(request);

			const expected = {
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
