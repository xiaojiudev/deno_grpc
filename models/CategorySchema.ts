import { UserCollection } from "./UserSchema.ts";
import { mongoose, ObjectId, Schema } from "../deps.ts";
import { MappingTypeMapping } from "../db/elasticsearch.ts";

export interface ICategory {
    id?: mongoose.Types.ObjectId;
    name: string;
    users?: mongoose.Types.ObjectId[];
    posts?: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface ICategoryMethods {
    toClient(): ICategory;
    getId(): string;
}

// deno-lint-ignore ban-types
type CategoryModel = mongoose.Model<ICategory, {}, ICategoryMethods>;

export const CategorySchema = new Schema<ICategory, CategoryModel, ICategoryMethods>({
    id: { type: ObjectId },
    name: { type: String, required: true },
    users: [{ type: mongoose.Types.ObjectId, ref: "Users", required: false }],
    posts: [{ type: mongoose.Types.ObjectId, ref: "Posts", required: false }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

CategorySchema.method("toClient", function () {
    const { _id, ...obj } = this.toObject();
    const newObj = obj;
    newObj.id = _id;
    return newObj;
});

CategorySchema.method("getId", function () {
    return this.toObject()._id.toString();
});

CategorySchema.set("toJSON", {
    virtuals: true,
});

CategorySchema.set("toObject", { virtuals: true });

CategorySchema.post("save", async function (doc) {
    console.log('ℹ️  POST SAVE CATEGORY HOOK');

    if (doc.users && doc.users.length > 0) {
        await UserCollection.updateMany(
            { _id: { $in: doc.users } },
            { $addToSet: { favCategories: doc._id } }
        );
    }
});

CategorySchema.post("insertMany", function (docs) {
    console.log('ℹ️  POST SAVE MANY CATEGORIES HOOK');
    docs.forEach(async (doc) => {
        if (doc.users && doc.users.length > 0) {
            await UserCollection.updateMany(
                { _id: { $in: doc.users } },
                { $addToSet: { favCategories: doc._id } }
            );
        }
    });
});

export const CategoryMapping: MappingTypeMapping = {
    properties: {
        id: { type: "keyword" },
        name: { type: "text" },
        users: { type: "keyword" },
        posts: { type: "keyword" },
        createdAt: { type: "date" },
        updatedAt: { type: "date" },
    }
}

export const CategoryCollection = mongoose.model("Categories", CategorySchema, "categories");