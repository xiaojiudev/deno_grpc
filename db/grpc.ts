import { GrpcServer } from "../deps.ts";
import { initPostService } from "../services/PostService.ts";
import { initKeywordService } from "../services/KeywordService.ts";
import { initUserService } from "../services/UserService.ts";

let grpcServer: GrpcServer | null = null;

export const getGrpcServer = async (): Promise<GrpcServer> => {
	if (grpcServer) {
		return grpcServer;
	}

	grpcServer = new GrpcServer();

	return grpcServer;
};

export const initGRPCService = async (): Promise<void> => {
	await Promise.all([
		initPostService(),
		initKeywordService(),
		initUserService(),
	]);
};
