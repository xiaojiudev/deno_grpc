import { APP_DATABASE_NAME, APP_DATABASE_URI, mongoose } from "../deps.ts";

export const connectDB = async (): Promise<void> => {
	const options = {
		dbName: APP_DATABASE_NAME,
	};

	await mongoose.connect(APP_DATABASE_URI, options as mongoose.ConnectOptions)
		.then((info) => {
			console.log(
				`Connected to Mongo Database successfully - port: ${info.connection.port}`,
			);
		})
		.catch((err) => {
			console.log("Not Connected to Database ERROR! ", err);
		});
};
