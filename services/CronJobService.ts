import { saveUserFavLog } from "./LogService.ts";
import { updateTrendingScore } from "./TrendingService.ts";

export const appCronJob = (): void => {
	try {
		Deno.cron("Update trending scores", { minute: { every: 1 } }, async () => {
			await updateTrendingScore();
			console.log("✅ Update trending scores successfully");
		});

		Deno.cron("Write user fav log", { minute: { every: 1 } }, async () => {
			await saveUserFavLog();
			console.log("✅ Write user fav log successfully");
		});
	} catch (error) {
		console.log("❌ Setup app CronJob ERROR");
		throw error;
	}
};
