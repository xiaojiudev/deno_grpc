import { Client, estypes } from "npm:@elastic/elasticsearch";
import { APP_ELASTICSEARCH_NAME, APP_ELASTICSEARCH_PW, APP_ELASTICSEARCH_URI } from "../deps.ts";

type SearchRequest = estypes.SearchRequest;
type SearchResponse = estypes.SearchResponse;
type SearchHitResponse = estypes.SearchHit<unknown>[];

let esClient: Client | null = null;

const connectEs = async (): Promise<Client | null> => {
    try {
        if (esClient) {
            return esClient;
        }

        esClient = new Client({
            node: APP_ELASTICSEARCH_URI,
            auth: {
                username: APP_ELASTICSEARCH_NAME,
                password: APP_ELASTICSEARCH_PW,
            }
        });

        const resp = await esClient.info();
        if (resp.name && resp.cluster_name && resp.cluster_uuid) {
            console.log("Connected to Elasticsearch successfully");
        }

        return esClient;

    } catch (error) {
        console.log("Connect to Elasticsearch failed");
        // console.log(error);
        return null;
    }
};

const createEsIndex = async (indexName: string): Promise<void> => {
    try {
        const esClient = await connectEs();
        if (esClient) {
            const isExist = await esClient.indices.exists({ index: indexName });
            if (!isExist) {
                const result = await esClient.indices.create({ index: indexName });
                console.log(result);
            }
        } else {
            console.log("Can connect to Elasticsearch");
        }
    } catch (error) {
        console.log("Create Elasticsearch index failed");
        // console.log(error);
    }
}

export const indexEsDocument = async (index: string, document: any): Promise<void> => {
    try {
        const esClient = await connectEs();
        await createEsIndex(index);
        if (esClient) {
            if (document instanceof Array) {
                for (const doc of document) {
                    const result = await esClient.index({
                        index,
                        id: doc?.id,
                        document: doc
                    });
                    console.log(`Indexed document ID: ${result._id}`, result);
                }
            } else if (document instanceof Object) {
                const result = await esClient.index({
                    index,
                    id: document?.id,
                    document
                });
                console.log(`Indexed document ID: ${result._id}`, result);
            }
        }
    } catch (error) {
        console.log("Index document failed");
        // console.log(error);
    }
}

export const queryEs = async (options: SearchRequest): Promise<SearchHitResponse | undefined> => {
    try {
        const esClient = await connectEs();
        if (esClient) {
            const searchResult: SearchResponse = await esClient.search({ ...options });

            const hits = searchResult.hits.hits;
            return hits;
        }
    } catch (error) {
        console.log("Search Es failed");
        // console.log(error);
    }
}