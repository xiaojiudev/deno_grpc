import { mongoose, ObjectId, Schema } from "../deps.ts";

export interface IPostRecommendation {
    id?: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    recommendedPosts: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface IPostRecommendationMethods {
    toClient(): IPostRecommendation;
    getId(): string;
}

// deno-lint-ignore ban-types
type PostRecommendationModel = mongoose.Model<IPostRecommendation, {}, IPostRecommendationMethods>;

const PostRecommendationSchema = new Schema<IPostRecommendation, PostRecommendationModel, IPostRecommendationMethods>({
    id: { type: ObjectId },
    user: { type: mongoose.Types.ObjectId, ref: "Users" },
    recommendedPosts: [{ type: mongoose.Types.ObjectId, ref: "Posts" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

PostRecommendationSchema.method("toClient", function () {
    const { _id, ...obj } = this.toObject();
    const newObj = obj;
    newObj.id = _id;
    return newObj;
});

PostRecommendationSchema.method("getId", function () {
    return this.toObject()._id.toString();
});

PostRecommendationSchema.set("toJSON", {
    virtuals: true,
});

PostRecommendationSchema.set("toObject", { virtuals: true });

export const PostRecommendationCollection = mongoose.model("PostRecommendation", PostRecommendationSchema, "post_recommendations");
