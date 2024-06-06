import { mongoose } from "../deps.ts";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

export interface IPost {
    id?: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    title: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IPostMethods {
    toClient(): IPost;
    getId(): string;
}

// deno-lint-ignore ban-types
type PostModel = mongoose.Model<IPost, {}, IPostMethods>;

const PostSchema = new Schema<IPost, PostModel, IPostMethods>({
    id: { type: ObjectId },
    user: { type: mongoose.Types.ObjectId, ref: 'User', },
    title: { type: String, required: true, },
    content: { type: String, required: true, },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

PostSchema.method('toClient', function () {
    const { _id, ...obj } = this.toObject();
    const newObj = obj;
    newObj.id = _id;
    return newObj;
});

PostSchema.method('getId', function () {
    return this.toObject()._id.toString();
});

PostSchema.set('toJSON', {
    virtuals: true,
});

PostSchema.set('toObject', { virtuals: true })

export const PostCollection = mongoose.model('Post', PostSchema);

