import { KeywordController } from '../controllers/KeywordController.ts';
import { SocialMediaController } from '../controllers/SocialMediaController.ts';
import { GrpcServer } from '../deps.ts';

let grpcServer: GrpcServer | null = null;

export const getGrpcServer = async (): Promise<GrpcServer> => {
    if (grpcServer) {
        return grpcServer;
    }

    grpcServer = new GrpcServer();

    return grpcServer;
}

export const initGRPCService = async (): Promise<void> => {
    await getGrpcServer();
    new SocialMediaController();
    new KeywordController();
}