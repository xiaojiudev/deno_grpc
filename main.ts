import { APP_GRPC_PORT } from "./deps.ts";
import { connectDB } from "./db/mongodb.ts";
import { getGrpcServer, initGRPCService } from "./grpc/grpc.ts";
import { connectEs, deleteIndex } from "./db/elasticsearch.ts";
import { getMockPostData } from "./utils/mockDB.ts";
import { updateTrendingScore } from "./services/TrendingService.ts";
import { appCronJob } from "./services/CronJobService.ts";

const startServer = async (): Promise<void> => {
	try {
		await connectDB();
		await connectEs();
		await getMockPostData();
		const grpcServer = getGrpcServer();
		await initGRPCService();
		appCronJob();
		console.log(`gRPC server gonna listen on ${APP_GRPC_PORT} port`);

		for await (const conn of Deno.listen({ port: APP_GRPC_PORT })) {
			grpcServer.handle(conn);
		}
	} catch (error) {
		console.log("Start server failed!", error);
		Deno.exit();
	}
};

startServer();
