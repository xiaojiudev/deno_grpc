import { SocialMediaService, getClient } from "./deps.ts";
const protoPath = new URL("./protos/social_media.proto", import.meta.url);
const protoFile = await Deno.readTextFile(protoPath);

const client = getClient<SocialMediaService>({
    port: 50051,
    root: protoFile,
    serviceName: "SocialMediaService",
});

await client
    .ListPost({})
    .then(data => console.log("All posts", data));

await client
    .ListTrendingPosts({})
    .then(data => console.log("Top 10 trending posts", data));
