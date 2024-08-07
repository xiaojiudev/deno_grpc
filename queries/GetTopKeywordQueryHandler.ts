import { QUERY_INDEX } from "../constant/index.ts";
import { getEs, isIndicesExist } from "../db/elasticsearch.ts";
import { Empty, KeywordList } from "../deps.ts";

export class GetTopKeywordQueryHandler {
	async handle(_query: Empty): Promise<KeywordList> {
		const esClient = getEs();

		if (!await isIndicesExist(QUERY_INDEX)) {
			console.log("⚠️  Query indices not exist - Let's search something...");
			return { keywords: [] };
		}

		const aggregationData = await esClient.search({
			index: QUERY_INDEX,
			_source: false,
			size: 0, // needn't search hits, just show the results
			query: {
				range: {
					"queryDate": { // query data within a range of one day
						gte: "now-1d/d",
						lte: "now/d",
					},
				},
			},
			aggs: {
				"top_query": {
					terms: {
						field: "queryString.keyword", // Use .keyword to aggregate on the exact value
						size: 10,
					},
					aggs: {
						"sort_by_count": {
							bucket_sort: {
								sort: [
									{ "_count": { order: "desc" } },
								],
							},
						},
					},
				},
			},
		});

		// @ts-ignore: Elasticsearch types don't fully capture aggregation structure
		const buckets = aggregationData.aggregations?.top_query.buckets;

		const topKeywords = buckets.map((item: { key: string; doc_count: number }) => {
			return { keyword: item.key, count: item.doc_count };
		});

		return { keywords: [...topKeywords] };
	}
}
