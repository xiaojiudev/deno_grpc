import { getEs } from "../db/elasticsearch.ts";
import { Empty, KeywordList } from "../deps.ts";

export class GetTopKeywordQueryHandler {
	async handle(_query: Empty): Promise<KeywordList> {
		const esClient = getEs();


		const aggregationData = await esClient.search({
			index: "queries",
			_source: false,
			aggs: {
				"top-query": {
					terms: {
						field: "queryString.keyword", // Use .keyword to aggregate on the exact value
						size: 10,
					},
					// aggs: {
					// 	"top-query-hits": {
					// 		top_hits: {
					// 			highlight: {
					// 				fields: {
					// 					"queryString": {}
					// 				}
					// 			}
					// 		}
					// 	}
					// },
					
				},
			}
		});
		console.log(aggregationData);

		return { keywords: [] };
	}
}
