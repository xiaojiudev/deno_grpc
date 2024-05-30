import { getGrpcServer } from '../db/grpc.ts';
import { KeywordService, TopKeywordsRequest, TopKeywordsResponse } from '../deps.ts';

export const initKeywordService = async () => {
    const grpcServer = await getGrpcServer();

    const keywordProtoPath = new URL("../protos/keyword.proto", import.meta.url);
    const keywordProtoFile = Deno.readTextFileSync(keywordProtoPath);


    grpcServer.addService<KeywordService>(keywordProtoFile, {
        GetTopKeywords: async (request: TopKeywordsRequest): Promise<TopKeywordsResponse> => {
            return { keywords: [] };
        }
    });
}