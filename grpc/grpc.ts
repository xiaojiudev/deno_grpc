import { GrpcServer } from "../deps.ts";
import { initPostService } from "./PostService.ts";
import { initUserService } from "./UserService.ts";

let grpcServer: GrpcServer | null = null;

export const initGrpcServer = (): GrpcServer => {
	try {
		if (grpcServer) {
			return grpcServer;
		}

		grpcServer = new GrpcServer();

		return grpcServer;
	} catch (error) {
		console.log("Init Grpc Server ERROR");
		throw error;
	}
};

export const initGRPCService = async (): Promise<GrpcServer> => {
	const grpcServerInstance = initGrpcServer();

	await Promise.all([
		initUserService(grpcServerInstance),
		initPostService(grpcServerInstance),
	]);

	return grpcServerInstance;
};
