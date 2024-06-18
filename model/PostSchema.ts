import { mongoose, ObjectId, Schema } from "../deps.ts";
import { CategoryCollection } from "./CategorySchema.ts";

export interface IPost {
	id?: mongoose.Types.ObjectId;
	user: mongoose.Types.ObjectId;
	title: string;
	content: string;
	categories?: mongoose.Types.ObjectId[];
	interactions?: IPostInteraction;
	trendingScore?: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IPostInteraction {
	likes: number;
	comments: number;
	shares: number;
	clicked: number;
	profileClicked: number;
	bookmarked: number;
	photoExpanded: number;
	videoPlayback: number;
}

interface IPostMethods {
	toClient(): IPost;
	getId(): string;
}

// deno-lint-ignore ban-types
type PostModel = mongoose.Model<IPost, {}, IPostMethods>;

const PostSchema = new Schema<IPost, PostModel, IPostMethods>({
	id: { type: ObjectId },
	user: { type: mongoose.Types.ObjectId, ref: "Users" },
	title: { type: String, required: true },
	content: { type: String, required: true },
	categories: [{ type: mongoose.Types.ObjectId, ref: "Categories", required: false }],
	interactions: {
		likes: { type: Number, default: 0 },
		comments: { type: Number, default: 0 },
		shares: { type: Number, default: 0 },
		clicked: { type: Number, default: 0 },
		profileClicked: { type: Number, default: 0 },
		bookmarked: { type: Number, default: 0 },
		photoExpanded: { type: Number, default: 0 },
		videoPlayback: { type: Number, default: 0 },
	},
	trendingScore: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

PostSchema.method("toClient", function () {
	const { _id, ...obj } = this.toObject();
	const newObj = obj;
	newObj.id = _id;
	return newObj;
});

PostSchema.method("getId", function () {
	return this.toObject()._id.toString();
});

PostSchema.set("toJSON", {
	virtuals: true,
});

PostSchema.set("toObject", { virtuals: true });

PostSchema.post("save", async function (doc) {
	console.log('POST SAVE HOOK');

	if (doc.categories && doc.categories.length > 0) {
		await CategoryCollection.updateMany(
			{ _id: { $in: doc.categories } },
			{ $addToSet: { posts: doc._id } }
		);
	}
});

PostSchema.post("insertMany", function (docs) {
	console.log('POST SAVE MANY HOOK');
	docs.forEach(async (doc) => {
		if (doc.categories && doc.categories.length > 0) {
			await CategoryCollection.updateMany(
				{ _id: { $in: doc.categories } },
				{ $addToSet: { posts: doc._id } }
			);
		}
	});
});

export const PostCollection = mongoose.model("Posts", PostSchema, "posts");
