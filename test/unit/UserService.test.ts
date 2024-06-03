import { ObjectId } from 'https://deno.land/x/web_bson@v0.3.0/mod.js';
import { CreateUserCommandHandler } from '../../commands/CreateUserCommandHandler.ts';
import { connectDB } from '../../db/mongodb.ts';
import { afterEach, beforeEach } from '../../deps.ts';
import {
	assertEquals,
	assertObjectMatch,
	CreateUserRequest,
	describe,
	it,
} from '../../deps.ts';
import { getUsersCollection } from '../../model/UserSchema.ts';

await connectDB();
const UserCollection = await getUsersCollection();

describe('Unit Test - User service', () => {
	const userIds: string[] = [];

	afterEach(async () => {
		userIds.forEach(async (id) => {
			await UserCollection.delete({ _id: new ObjectId(id) });
		});
	});

	describe('Create user', () => {
		it('should return an object of failed if username and password are empty', async () => {
			const command = new CreateUserCommandHandler();
			const request: CreateUserRequest = {};
			const actualRes = await command.handle(request);

			const expected = {
				success: false,
				message: 'Check your fields are valid before continuing',
			};
			assertObjectMatch(actualRes, expected);
		});

		it('should return an object of failed if username not contain 6-16 characters or numbers', async () => {
			const command = new CreateUserCommandHandler();
			const request: CreateUserRequest = {
				username: '1',
				password: 'password',
			};
			const actualRes = await command.handle(request);

			const expected = {
				success: false,
				message:
					'Username required 6-16 characters, only letters and numbers are allowed',
			};
			assertObjectMatch(actualRes, expected);
		});

		it('should return an object of failed if password not satisfy minimum 8 characters, at least one letter and one number', async () => {
			const command = new CreateUserCommandHandler();
			const request: CreateUserRequest = {
				username: 'username',
				password: '123',
			};
			const actualRes = await command.handle(request);

			const expected = {
				success: false,
				message:
					'Password required minimum eight characters, at least one letter and one number',
			};
			assertObjectMatch(actualRes, expected);
		});

		it('should return an object of failed if user already exist', async () => {
			const command = new CreateUserCommandHandler();
			const request: CreateUserRequest = {
				username: 'username',
				password: 'password123',
			};

			const firstRes = await command.handle(request);
			const actualRes = await command.handle(request);

			const expected = {
				success: false,
				message: 'User already exist!',
			};

			assertObjectMatch(actualRes, expected);

			const userId = await UserCollection.findOne({
				username: request.username,
			})
				.then((res) => res && res?._id?.toString());

			if (userId) {
				userIds.push(userId);
			}
		});

		it('should add a new user to the mongoDB', async () => {
			const command = new CreateUserCommandHandler();
			const request: CreateUserRequest = {
				username: 'username',
				password: 'password123',
			};

			const actualRes = await command.handle(request);

			const expected = {
				success: true,
				message: 'User created successfully',
			};

			assertObjectMatch(actualRes, expected);

			const userId = await UserCollection.findOne({
				username: request.username,
			})
				.then((res) => res && res?._id?.toString());

			if (userId) {
				userIds.push(userId);
			}
		});
	});
});
