// deno-lint-ignore-file no-explicit-any
import { Client, estypes } from "npm:@elastic/elasticsearch";
import { APP_ELASTICSEARCH_NAME, APP_ELASTICSEARCH_PW, APP_ELASTICSEARCH_URI } from "../deps.ts";

export type SearchRequest = estypes.SearchRequest;
export type SearchResponse = estypes.SearchResponse;
export type SearchHitResponse = estypes.SearchHit<unknown>[];
export type IndicesIndexSettings = estypes.IndicesIndexSettings;
export type MappingTypeMapping = estypes.MappingTypeMapping;
export type SearchHit = estypes.SearchHit<unknown>; //TODO: remove (not used)

let esClient: Client | null = null;

export const connectEs = async (): Promise<Client> => {
	try {
		if (esClient) {
			return esClient;
		}

		esClient = new Client({
			node: APP_ELASTICSEARCH_URI,
			auth: {
				username: APP_ELASTICSEARCH_NAME,
				password: APP_ELASTICSEARCH_PW,
			},
		});

		const resp = await esClient.info();
		const portRunning = esClient.connectionPool.connections[0].url.port;

		if (resp.name && resp.cluster_name && resp.cluster_uuid) {
			console.log(
				"Connected to Elasticsearch successfully - port: " + portRunning,
			);
		}

		return esClient;
	} catch (error) {
		console.log("Connected to Elasticsearch ERROR");
		throw error;
	}
};

export const getEs = (): Client => {
	if (!esClient) {
		throw new Error("Elasticsearch connection failed");
	}

	return esClient;
};

export const closeEsConnection = async (): Promise<void> => {
	const client = getEs();
	if (client) {		
		
		// clearTimeout();
		await client.close();
		console.log("Closed Elasticsearch connection successfully");
	}
}

export const createEsIndex = async (
	indexName: string,
	settings?: IndicesIndexSettings,
	mappings?: MappingTypeMapping,
): Promise<boolean> => {
	const esClient = await connectEs();
	if (esClient) {
		const isExist = await esClient.indices.exists({ index: indexName });
		if (!isExist) {
			const result = await esClient.indices.create({
				index: indexName,
				settings: settings,
				mappings: mappings,
			});
			console.log(result);
		}

		return true;
	}

	return false;
};

export const indexEsDocument = async (
	index: string,
	document: any, // TODO: use unknown type
	settings?: IndicesIndexSettings,
	mappings?: MappingTypeMapping,
): Promise<void> => {
	try {
		const esClient = await connectEs();
		await createEsIndex(index, settings, mappings);
		if (esClient) {
			if (document instanceof Array) {
				for (const doc of document) {
					const result = await esClient.index({
						index,
						id: doc?.id,
						document: doc,
					});
					console.log(`Indexed document ID: ${result._id}`, result);
				}
			} else if (document instanceof Object) {
				const result = await esClient.index({
					index,
					id: document?.id,
					document: document,
				});
				console.log(`Indexed document ID: ${result._id}`, result);
			}
		}
	} catch (error) {
		console.log("Index document failed");
		console.log(error);
	}
};

export const queryEs = async (
	options: SearchRequest,
): Promise<SearchHitResponse | undefined> => {
	const esClient = await connectEs();
	if (esClient) {
		try {
			const searchResult: SearchResponse = await esClient.search({
				...options,
			});
			const hits = searchResult.hits.hits;
			return hits;
		} catch (error) {
			console.log("Search error: " + error);
		}
	}

	return undefined;
};

export const deleteIndex = async (indexName: string): Promise<boolean> => { //TODO: not used
	const esClient = await connectEs();
	if (esClient) {
		const result = await esClient.indices.delete({ index: indexName });
		if (result.acknowledged) {
			console.log("Delete Index successfully");
			return true;
		} else {
			console.log("Delete Index failed");
		}
	}
	return false;
};

export const deleteEsDocuments = async ( //TODO: not used
	indexName: string,
): Promise<boolean> => {
	const esClient = await connectEs();
	if (esClient) {
		const result = await esClient.deleteByQuery({
			index: indexName,
			query: {
				match_all: {},
			},
		});

		return true;
	}
	return false;
};

export const deleteEsDocumentById = async (
	indexName: string,
	id: string,
): Promise<boolean> => {
	const esClient = await connectEs();
	if (esClient) {
		const result = await esClient.delete({
			index: indexName,
			id: id,
		});

		if (result.result === "deleted") {
			return true;
		}
	}
	return false;
};
export const updateEsDocument = async (
	indexName: string,
	id: string,
	payload: any, // TODO: use unknown type
): Promise<boolean> => {
	const esClient = await connectEs();

	if (esClient) {
		const result = await esClient.update({
			index: indexName,
			id,
			doc: {
				id,
				...payload,
			},
			doc_as_upsert: true,
		});

		if (result.result === "updated") {
			return true;
		}
	}

	return false;
};
