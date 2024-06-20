import { APP_GRPC_PORT } from "./deps.ts";
import { connectDB } from "./db/mongodb.ts";
import { initGRPCService } from "./grpc/grpc.ts";
import { connectEs } from "./db/elasticsearch.ts";
import { getMockPostData } from "./utils/mockDB.ts";
import { appCronJob } from "./services/CronJobService.ts";

const startServer = async (): Promise<void> => {
	try {
		await connectDB();
		await connectEs();
		const grpcInstance = await initGRPCService();
		await getMockPostData();
		appCronJob();
		console.log(`gRPC server gonna listen on - port: ${APP_GRPC_PORT} `);

		for await (const conn of Deno.listen({ port: APP_GRPC_PORT })) {
			grpcInstance.handle(conn);
		}
	} catch (error) {
		console.log("Start server failed!", error);
		Deno.exit();
	}
};

startServer();
