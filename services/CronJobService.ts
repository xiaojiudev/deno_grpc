import { saveUserFavLog } from "./LogService.ts";
import { updateTrendingScore } from "./TrendingService.ts";

export const appCronJob = (): void => {
	try {
		Deno.cron("Update trending scores", { minute: { every: 1 } }, async () => {
			console.log("Updating trending scores...");
			await updateTrendingScore();
		});

		Deno.cron("Write user fav log", { minute: { every: 1 } }, async () => {
			console.log("Write user fav log");
			await saveUserFavLog();
		});
	} catch (error) {
		console.log("Setup app CronJob ERROR");
		throw error;
	}
};
