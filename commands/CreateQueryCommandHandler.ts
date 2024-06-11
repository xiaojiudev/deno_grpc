import { QUERY_INDEX } from "../constant/index.ts";
import { IndicesIndexSettings, MappingTypeMapping, deleteIndex, getEs, indexEsDocument, queryEs } from "../db/elasticsearch.ts";
import { SearchRequest } from "../deps.ts";
import { IQuery, QueryCollection } from "../model/QuerySchema.ts";

const settings: IndicesIndexSettings = {
	analysis: {
		filter: {
			autocomplete_filter: {
				type: 'edge_ngram',
				min_gram: 1,
				max_gram: 20,
			},
		},
		analyzer: {
			autocomplete: {
				type: 'custom',
				tokenizer: 'standard',
				filter: ['lowercase', 'asciifolding', 'autocomplete_filter'],
			},
		},
	},
}

const mappings: MappingTypeMapping = {
	properties: {
		query_text: {
			type: 'text',
			analyzer: 'autocomplete',
			search_analyzer: 'standard',
		},
	}
}

export class CreateSearchCommandHandler {
	async handle(searchRequest: SearchRequest): Promise<void> {
		const esClient = getEs();

		const searchString = searchRequest?.search ?? "";
		const searchBeauty = searchString.trim()
			.toLocaleLowerCase()
			.split(" ")
			.filter((e, index, self) => e && self.indexOf(e) === index) // remove empty, null, undefind and duplicate elements
			.join(" ");

		if (searchBeauty === "") {
			return;
		}
		console.log(searchBeauty);

		const payload: IQuery = {
			queryString: searchBeauty,
			queryCount: 1
		}

		const insertDoc = await QueryCollection.create({ ...payload });

		if (insertDoc) {
			await indexEsDocument(QUERY_INDEX, { ...insertDoc.toClient() }, { ...settings }, { ...mappings });
		}

		// const esRes = await queryEs({
		// 	index: QUERY_INDEX,
		// 	query: {
		// 		match: {
		// 			queryString: {
		// 				query: searchBeauty,
		// 				fuzziness: "AUTO"
		// 			}
		// 		}
		// 	}
		// });

		// console.log(esRes);
	}
}
