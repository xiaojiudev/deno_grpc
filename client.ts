import { KeywordService, SocialMediaService, getClient } from "./deps.ts";
const postProtoPath = new URL("./protos/social_media.proto", import.meta.url);
const postProtoFile = await Deno.readTextFile(postProtoPath);

const keywordProtoPath = new URL("./protos/keyword.proto", import.meta.url);
const keywordProtoFile = await Deno.readTextFile(keywordProtoPath);

const clientA = getClient<SocialMediaService>({
    port: 50051,
    root: postProtoFile,
    serviceName: "SocialMediaService",
});

const clientB = getClient<KeywordService>({
    port: 50051,
    root: keywordProtoFile,
    serviceName: "KeywordService",
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

await clientB
    .GetTopKeywords({})
    .then(data => console.log("Top 10 hot keyword", data));

clientA.close();
clientB.close();