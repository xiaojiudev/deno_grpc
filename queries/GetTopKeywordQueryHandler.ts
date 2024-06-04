import { queryEs } from "../db/elasticsearch.ts";
import { Empty, KeywordList } from "../deps.ts";
import { WordBagSchema } from "../model/WordBagSchema.ts";

export interface WordBagEs extends WordBagSchema {
	id: string;
}

export class GetTopKeywordQueryHandler {
	async handle(_query: Empty): Promise<KeywordList> {
		const currentDate = new Date().toISOString().split("T")[0];

		const wordbagData = await queryEs({
			index: "wordbag",
			_source: true,
			size: 10,
			query: {
				function_score: {
					score_mode: "multiply", // scores are multiplied
					boost_mode: "multiply", // query score and function score is multiplied 
					functions: [
						{
							gauss: {
								"dateCount.date": {
									origin: 'now/d',
									scale: '3d',
									decay: 0.5,
								}
							},
						},
					],
					query: {
						bool: {
							should: [
								{
									term: {
										"dateCount.date": 'now/d',
									},
								},
								{
									range: {
										"dateCount.date": {
											gte: "now-7d/d",
											lte: "now/d"
										}
									},
								},
							],
						},

					},
				}
			},
			sort: [{
				"_score": { order: "desc" }
			},
			{
				"dateCount.count": {
					order: "desc",
					mode: "avg",
				},
			},
			],
		});

		console.log(wordbagData);


		if (wordbagData) {
			// deno-lint-ignore no-explicit-any
			const mappedData = wordbagData.map((wordEs: any) => {
				const word = wordEs._source as WordBagEs;

				return word.word;
			});

			return { keywords: [...mappedData] };
		}

		return { keywords: [] };
	}
}
