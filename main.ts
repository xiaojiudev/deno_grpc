import {
    APP_GRPC_PORT,
} from "./deps.ts";
import { connectDB } from "./db/mongodb.ts";
import { connectEs } from "./db/elasticsearch.ts";
import { getMockPostData } from "./utils/mockDB.ts";
import { updateTrendingScore } from "./services/TrendingService.ts";
import { getGrpcServer, initGRPCService } from './server.ts';

startServer();

async function startServer(): Promise<void> {
    try {
        await connectDB();
        await connectEs();
        await getMockPostData();
        const grpcServer = await getGrpcServer();
        await initGRPCService();
        appCronJob();

        console.log(`gRPC server gonna listen on ${APP_GRPC_PORT} port`);

        for await (const conn of Deno.listen({ port: APP_GRPC_PORT, })) {
            grpcServer.handle(conn);
        }
    } catch (error) {
        console.log("Start server failed!", error);
    }
}

function appCronJob(): void {
    Deno.cron("Update trending scores", { minute: { every: 1 } }, async () => {
        console.log("Updating trending scores...");
        await updateTrendingScore();
    });
}
