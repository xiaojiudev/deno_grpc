import { SearchRequest } from '../deps.ts';
import { WordBagSchema } from '../model/WordBagSchema.ts';
import { getWordBagCollection } from '../model/WordBagSchema.ts';

export class UpdateKeywordSearchCountHandler {
    async handle(searchRequest: SearchRequest): Promise<void> {
        const stopwordPath = new URL("../db/stopwords.txt", import.meta.url);
        const stopwordText = Deno.readTextFileSync(stopwordPath);
        const stopwordsArr = stopwordText.split("\r\n");

        const searchString = searchRequest?.search ?? "";
        const searchArr = searchString.trim()
            .toLocaleLowerCase()
            .split(" ")
            .filter((e, index, self) => e && self.indexOf(e) === index) // remove empty, null, undefind and duplicate elements
            .filter((e) => !stopwordsArr.includes(e)); // remove stopwords like a, an, the, and, ...

        if (searchString === "" || searchArr.length === 0) {
            return;
        }

        console.log(searchArr);

        const today = new Date();
        const todayDateStr = today.toISOString().split('T')[0];

        const WordBagCollection = await getWordBagCollection();

        for (const word of searchArr) {
            const existingWordBag = await WordBagCollection.findOne({ word });

            if (existingWordBag) {
                let dateUpdated = false;
                for (const dateCount of existingWordBag.dateCount) {
                    const dateStr = dateCount.date.toISOString().split('T')[0];
                    if (dateStr === todayDateStr) {
                        dateCount.count += 1;
                        dateUpdated = true;
                        break;
                    }
                }

                if (!dateUpdated) {
                    existingWordBag.dateCount.push({ date: today, count: 1 });
                }

                existingWordBag.totalCount += 1;

                await WordBagCollection.updateOne({ _id: existingWordBag._id }, { $set: { dateCount: existingWordBag.dateCount, totalCount: existingWordBag.totalCount } });
            } else {
                const payload: WordBagSchema = {
                    word,
                    dateCount: [{ date: today, count: 1 },],
                    totalCount: 1,
                }

                await WordBagCollection.insertOne(payload);
            }
        }

    }
}