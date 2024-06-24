import { APP_DATABASE_NAME, APP_DATABASE_URI, mongoose } from "../deps.ts";

const configOptions = {
	dbName: APP_DATABASE_NAME,
} as mongoose.ConnectOptions;

export const connectDB = async (): Promise<void> => {
	await mongoose
		.connect(APP_DATABASE_URI, configOptions)
		.then((info) => {
			console.log(`Connected to MongoDB successfully - port: ${info.connection.port}`);
		})
		.catch((err) => {
			console.log("Connected to MongoDB ERROR! ", err);
			throw err;
		});
};
