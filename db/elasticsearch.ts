import { Client, estypes } from "npm:@elastic/elasticsearch";
import { APP_ELASTICSEARCH_NAME, APP_ELASTICSEARCH_PW, APP_ELASTICSEARCH_URI } from "../deps.ts";

export type SearchRequest = estypes.SearchRequest;
export type SearchResponse = estypes.SearchResponse;
export type SearchHitResponse = estypes.SearchHit<unknown>[];
export type IndicesIndexSettings = estypes.IndicesIndexSettings;
export type MappingTypeMapping = estypes.MappingTypeMapping;
type InforResponse = estypes.InfoResponse;

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

		const resp: InforResponse = await esClient.info();
		const portRunning: number = esClient.connectionPool.connections[0].url.port;

		if (resp.name && resp.cluster_name && resp.cluster_uuid) {
			console.log(
				"✅ Connected to Elasticsearch successfully - port: " + portRunning,
			);
		}

		return esClient;
	} catch (error) {
		console.log("❌ Connected to Elasticsearch ERROR");
		throw error;
	}
};

export const getEs = (): Client => {
	if (!esClient) {
		throw new Error("❌ Elasticsearch connection failed");
	}

	return esClient;
};

export const closeEsConnection = async (): Promise<void> => {
	if (esClient) {
		await esClient.close();
		esClient = null;
		console.log("✅ Closed Elasticsearch connection");
	}
};

export const isIndicesExist = async (indexName: string): Promise<boolean> => {
	return await getEs().indices.exists({ index: indexName });
};

export const createEsIndex = async (
	indexName: string,
	mappings: MappingTypeMapping,
	settings?: IndicesIndexSettings,
): Promise<void> => {
	const esClient = await connectEs();
	if (esClient) {
		if (await !isIndicesExist(indexName)) {
			await esClient.indices.create({
				index: indexName,
				mappings: mappings,
				settings: settings,
			});
			console.log(`✅ Create ${indexName.toUpperCase()} indices successfully`);
		} else {
			console.log(`⚠️  ${indexName.toUpperCase()} indices already exists`);
		}
	}
};

export const deleteEsIndex = async (indexName: string) => {
	const esClient = await connectEs();
	if (esClient) {
		if (await isIndicesExist(indexName)) {
			await esClient.indices.delete({ index: indexName });
			console.log(`✅ Delete ${indexName.toUpperCase()} indices successfully`);
		} else {
			console.log(`⚠️  ${indexName.toUpperCase()} indices not exists`);
		}
	}
};

export const indexEsDocument = async (
	index: string,
	document: unknown,
): Promise<void> => {
	try {
		const esClient = await connectEs();
		if (esClient) {
			if (document instanceof Array) {
				for (const doc of document) {
					const result = await esClient.index({
						index,
						id: doc?.id,
						document: doc,
						refresh: true,
					});
					console.log(`✅ Indexed document ID: ${result._id}`, result);
				}
			} else if (document instanceof Object && "id" in document) {
				const result = await esClient.index({
					index,
					id: document.id as string,
					document: document,
					refresh: true,
				});
				console.log(`✅ Indexed document ID: ${result._id}`, result);
			}
		}
	} catch (error) {
		console.log("❌ Index document failed", error);
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
			console.log("❌ Search error: " + error);
		}
	}

	return undefined;
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
	payload: unknown,
): Promise<boolean> => {
	const esClient = await connectEs();

	if (esClient) {
		const result = await esClient.update({
			index: indexName,
			id,
			doc: {
				id,
				...payload as object,
			},
			doc_as_upsert: true,
		});

		if (result.result === "updated") {
			return true;
		}
	}

	return false;
};
