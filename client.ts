import { getClient, SocialMediaService } from "./deps.ts";
const postProtoPath = new URL("./protos/social_media.proto", import.meta.url);
const postProtoFile = await Deno.readTextFile(postProtoPath);

const clientA = getClient<SocialMediaService>({
	port: 50051,
	root: postProtoFile,
	serviceName: "SocialMediaService",
});

// await clientA
//     .ListPost({})
//     .then(data => console.log("All posts", data));

// await clientA
//     .ListTrendingPosts({})
//     .then(data => console.log("Top 10 trending posts", data));

// await clientA
//     .SearchPost({ search: "Category B" })
//     .then(data => console.log("Search results", data));

await clientA
	.ListTrendingKeywords({})
	.then((data) => console.log("Top 10 hot keyword", data));

await clientA
	.RecommendPosts({userId: "665d7484f89adaa511c994c9"})
	.then((data) => console.log("Recommend posts", data));

clientA.close();
