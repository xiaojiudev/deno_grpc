import { saveUserFavLog } from "./LogService.ts";
import { updateTrendingScore } from "./TrendingService.ts";

export const appCronJob = (): void => {
	Deno.cron("Update trending scores", { minute: { every: 1 } }, async () => {
		console.log("Updating trending scores...");
		await updateTrendingScore();
	});

	Deno.cron("Write user fav log", { minute: { every: 1 } }, async () => {
		console.log("Write user fav log");
		await saveUserFavLog();
	});
};
