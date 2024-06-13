import { mongoose, ObjectId, Schema } from "../deps.ts";

export interface IUserFavorite {
    id?: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    favCategories: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface IUserFavoriteMethods {
    toClient(): IUserFavorite;
    getId(): string;
}

// deno-lint-ignore ban-types
type UserFavoriteModel = mongoose.Model<IUserFavorite, {}, IUserFavoriteMethods>;

const UserFavoriteSchema = new Schema<IUserFavorite, UserFavoriteModel, IUserFavoriteMethods>({
    id: { type: ObjectId },
    user: { type: mongoose.Types.ObjectId, ref: "Users" },
    favCategories: [{ type: String, required: false }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

UserFavoriteSchema.method("toClient", function () {
    const { _id, ...obj } = this.toObject();
    const newObj = obj;
    newObj.id = _id;
    return newObj;
});

UserFavoriteSchema.method("getId", function () {
    return this.toObject()._id.toString();
});

UserFavoriteSchema.set("toJSON", {
    virtuals: true,
});

UserFavoriteSchema.set("toObject", { virtuals: true });

export const UserFavoriteCollection = mongoose.model("UserFavorites", UserFavoriteSchema, "user_favorites");
