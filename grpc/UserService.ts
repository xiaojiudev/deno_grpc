import { CreateUserCommandHandler } from "../commands/CreateUserCommandHandler.ts";
import { CreateUserRequest, CreateUserResponse, GrpcServer, UserService } from "../deps.ts";

export const initUserService = (grpcServerInstance: GrpcServer) => {
	const userProtoPath = new URL("../protos/user.proto", import.meta.url);
	const userProtoFile = Deno.readTextFileSync(userProtoPath);

	grpcServerInstance.addService<UserService>(userProtoFile, {
		CreateUser: async (request: CreateUserRequest): Promise<CreateUserResponse> => {
			const command = new CreateUserCommandHandler();
			return await command.handle(request);
		},
	});
};
