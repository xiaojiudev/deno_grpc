import { mongoose, ObjectId, Schema } from "../deps.ts";
import { MappingTypeMapping } from "../db/elasticsearch.ts";

export interface IQuery {
	id?: mongoose.Types.ObjectId;
	queryString: string;
	queryDate?: Date;
}

interface IQueryMethods {
	toClient(): IQuery;
	getId(): string;
}

// deno-lint-ignore ban-types
type QueryModel = mongoose.Model<IQuery, {}, IQueryMethods>;

const QuerySchema = new Schema<IQuery, QueryModel, IQueryMethods>({
	id: { type: ObjectId },
	queryString: { type: String, required: true },
	queryDate: { type: Date, required: false, default: Date.now },
});

QuerySchema.method("toClient", function () {
	const { _id, ...obj } = this.toObject();
	const newObj = obj;
	newObj.id = _id;
	return newObj;
});

QuerySchema.method("getId", function () {
	return this.toObject()._id.toString();
});

QuerySchema.set("toJSON", {
	virtuals: true,
});

QuerySchema.set("toObject", { virtuals: true });

export const QueryMapping: MappingTypeMapping = {
	properties: {
		id: { type: "keyword" },
		queryString: { type: "text" },
		queryDate: { type: "date" },
	},
};

export const QueryCollection = mongoose.model("Queries", QuerySchema, "queries");
