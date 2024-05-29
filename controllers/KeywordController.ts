import { KeywordService, TopKeywordsResponse } from '../deps.ts';
import { getGrpcServer } from '../db/grpc.ts';

export class KeywordController {
    constructor() {
        this.addService();
    }

    async addService() {
        const grpcServer = await getGrpcServer();

        const keywordProtoPath = new URL("../protos/keyword.proto", import.meta.url);
        const keywordProtoFile = Deno.readTextFileSync(keywordProtoPath);


        grpcServer.addService<KeywordService>(keywordProtoFile, {
            GetTopKeywords: async (request): Promise<TopKeywordsResponse> => {
                return { keywords: [] };
            }
        });
    }
}