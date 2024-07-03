import { mongoose, ObjectId, Schema } from "../deps.ts";
import { MappingTypeMapping } from "../db/elasticsearch.ts";

export interface IUser {
	id?: mongoose.Types.ObjectId;
	username: string;
	password: string;
	favCategories?: mongoose.Types.ObjectId[];
	createdAt?: Date;
}

interface IUserMethods {
	toClient(): IUser;
	getId(): string;
}

// deno-lint-ignore ban-types
type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
	id: { type: ObjectId },
	username: { type: String, required: true },
	password: { type: String, required: true },
	favCategories: [{ type: String, ref: "Categories", required: false }],
	createdAt: { type: Date, default: Date.now },
});

UserSchema.method("toClient", function () {
	const { _id, ...obj } = this.toObject();
	const newObj = obj;
	newObj.id = _id;
	return newObj;
});

UserSchema.method("getId", function () {
	return this.toObject()._id.toString();
});

UserSchema.set("toJSON", {
	virtuals: true,
});

UserSchema.set("toObject", { virtuals: true });

export const UserMapping: MappingTypeMapping = {
	properties: {
		id: { type: "keyword" },
		username: { type: "text" },
		password: { type: "keyword" },
		favCategories: { type: "keyword" },
		createdAt: { type: "date" },
	},
};

export const UserCollection = mongoose.model("Users", UserSchema, "users");
