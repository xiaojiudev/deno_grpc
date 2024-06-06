import { APP_GRPC_PORT } from "./deps.ts";
import { connectDB } from "./db/mongodb.ts";
import { getGrpcServer, initGRPCService } from "./db/grpc.ts";
import { connectEs } from "./db/elasticsearch.ts";

const startServer = async (): Promise<void> => {
	try {
		await connectDB();
		await connectEs();
		const grpcServer = getGrpcServer();
		await initGRPCService();

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
