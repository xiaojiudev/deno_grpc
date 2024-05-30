import { getDB } from '../db/mongodb.ts';
import { Bson, Collection } from '../deps.ts';

export interface WordBagSchema {
    _id?: Bson.ObjectId;
    word: string
    dateCount: DateCount[]
    totalCount: number
}

export interface DateCount {
    date: Date
    count: number
}

let wordBagCollection: Collection<WordBagSchema> | null = null;

export const getWordBagCollection = async () => {
    if (wordBagCollection) {
        return wordBagCollection;
    }

    const db = await getDB();
    wordBagCollection = db.collection<WordBagSchema>("wordbag");
    return wordBagCollection;
}