import { queryEs } from '../db/elasticsearch.ts';
import { TopKeywordsRequest, TopKeywordsResponse } from '../deps.ts';
import { WordBagSchema } from '../model/WordBagSchema.ts';

export interface WordBagEs extends WordBagSchema {
    id: string;
}

export class GetTopKeywordQueryHandler {
    async handle(query: TopKeywordsRequest): Promise<TopKeywordsResponse> {
        const currentDate = new Date().toISOString().split('T')[0];
        console.log(currentDate);

        const wordbagData = await queryEs({
            index: 'wordbag',
            query: {
                match_all: {}
            },
            size: 10,
            sort: [{ "totalCount": "desc" }]
        });

        if (wordbagData) {
            const mappedData = wordbagData.map((wordEs: any) => {
                const word = wordEs._source as WordBagEs;

                return word.word;
            });

            return { keywords: [...mappedData] }
        }


        return { keywords: [] };
    }
}