import { bcrypt, CreateUserRequest, CreateUserResponse } from "../deps.ts";
import { UserInteractionSchema } from "../model/UserSchema.ts";
import { getUsersCollection, UserSchema } from "../model/UserSchema.ts";

export class CreateUserCommandHandler {
	async handle(request: CreateUserRequest): Promise<CreateUserResponse> {
		const { username, password } = request;

		if (!username || !password) {
			return {
				success: false,
				message: "Check your fields are valid before continuing",
			};
		}

		const usernameRegex = /^[0-9A-Za-z]{6,16}$/;
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

		if (!usernameRegex.test(username)) {
			return {
				success: false,
				message: "Username required 6-16 characters, only letters and numbers are allowed",
			};
		}

		if (!passwordRegex.test(password)) {
			return {
				success: false,
				message:
					"Password required minimum eight characters, at least one letter and one number",
			};
		}

		const UserCollection = await getUsersCollection();
		const existingUser = await UserCollection.findOne({
			username: username,
		});

		if (existingUser) {
			return {
				success: false,
				message: "User already exist!",
			};
		}

		const salt = await bcrypt.genSalt(8);
		const pwHash = await bcrypt.hash(password, salt);

		const payload: UserSchema = {
			username,
			password: pwHash,
			favoriteCategories: [],
			interactions: {} as UserInteractionSchema,
		};

		const insetId = await UserCollection.insertOne({ ...payload });

		if (insetId) {
			return {
				success: true,
				message: "User created successfully",
			};
		}

		return {
			success: false,
			message: "Something went wrong",
		};
	}
}
