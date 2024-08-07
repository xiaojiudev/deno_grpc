import { QUERY_INDEX } from "../constant/index.ts";
import { indexEsDocument } from "../db/elasticsearch.ts";
import { SearchRequest } from "../deps.ts";
import { IQuery, QueryCollection } from "../models/QuerySchema.ts";

export class CreateQueryCommandHandler {
	public async handle(searchRequest: SearchRequest): Promise<void> {
		const searchString = searchRequest?.search ?? "";
		const searchBeauty = searchString.trim()
			.toLocaleLowerCase()
			.split(" ")
			.filter((e, index, self) => e && self.indexOf(e) === index) // remove empty, null, undefind and duplicate elements
			.join(" ");

		if (searchBeauty === "") {
			return;
		}

		const payload: IQuery = {
			queryString: searchBeauty,
		};

		const insertDoc = await QueryCollection.create({ ...payload });

		if (insertDoc) {
			await indexEsDocument(QUERY_INDEX, { ...insertDoc.toClient() });
		}
	}
}
