import { CreateUserCommandHandler } from "../commands/CreateUserCommandHandler.ts";
import { getGrpcServer } from "../db/grpc.ts";
import { CreateUserRequest, CreateUserResponse, UserService } from "../deps.ts";

export const initUserService = async () => {
	const grpcServer = await getGrpcServer();

	const userProtoPath = new URL("../protos/user.proto", import.meta.url);
	const userProtoFile = Deno.readTextFileSync(userProtoPath);

	grpcServer.addService<UserService>(userProtoFile, {
		CreateUser: async (request: CreateUserRequest): Promise<CreateUserResponse> => {
			const command = new CreateUserCommandHandler();
			return await command.handle(request);
		},
	});
};