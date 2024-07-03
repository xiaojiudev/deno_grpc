import { bcrypt, CreateUserRequest, CreateUserResponse } from "../deps.ts";
import { UserCollection } from "../models/UserSchema.ts";

export class CreateUserCommandHandler {
	public async handle(request: CreateUserRequest): Promise<CreateUserResponse> {
		const { username, password } = request;

		if (!username || !password) {
			return {
				success: false,
				message: "Check your fields are valid before continuing",
			};
		}

		const checkValidRes = await this.checkValidFields(username, password);

		if (!checkValidRes.success) {
			return checkValidRes;
		}

		const salt = await bcrypt.genSalt(8);
		const pwHash = await bcrypt.hash(password, salt);

		const payload = {
			username,
			password: pwHash,
		};

		const savedUser = await UserCollection.create({ ...payload });

		if (savedUser) {
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

	private async checkValidFields(
		username: string,
		password: string,
	): Promise<CreateUserResponse> {
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

		const existingUser = await UserCollection.findOne({ username: username });

		if (existingUser) {
			return {
				success: false,
				message: "User already exist!",
			};
		}

		return {
			success: true,
			message: "Fields are valid",
		};
	}
}
