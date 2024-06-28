export { Hono } from "https://deno.land/x/hono@v4.3.7/mod.ts";

export { GrpcServer } from "https://deno.land/x/grpc_basic@0.4.7/server.ts";

export { getClient } from "https://deno.land/x/grpc_basic@0.4.7/client.ts";

export {
	Database,
	MongoClient,
} from "https://deno.land/x/mongo@v0.32.0/mod.ts";

export * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export * from "./types/social_media.d.ts";

export * from "./types/user.d.ts";

export * from "./utils/bootstrap.ts";

import mongoose from "npm:mongoose@8.4.1";

export { mongoose };

export const Schema = mongoose.Schema;

export const ObjectId = Schema.ObjectId;

export type ObjectIdType = mongoose.Types.ObjectId;

export const validObjectId = (id: string): boolean => {
	return mongoose.isValidObjectId(id);
};

export const generateObjectId = (id?: string): ObjectIdType => {
	if(id && validObjectId(id)) {
		// @ts-ignore mongoose ObjectId typescript bug
		return new mongoose.Types.ObjectId(id);
	} else {
		return new mongoose.Types.ObjectId();
	}
}