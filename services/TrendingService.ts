import { POST_INDEX } from "../constant/index.ts";
import { getEs } from "../db/elasticsearch.ts";
import { IPost, PostCollection } from "../model/PostSchema.ts";

const DECAY_RATE = 0.95;

const EVENT_TYPE_STRENGTH = {
    IS_VIDEO_PLAYBACK: 0.01,
    IS_PHOTO_EXPANDED: 0.02,
    IS_CLICKED: 0.2,
    IS_LIKED: 0.3,
    IS_PROFILE_CLICKED: 0.5,
    IS_BOOKMARKED: 0.6,
    IS_SHARED: 0.9,
    IS_COMMENTED: 1.0,
};

const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-x / 999));
}

const calculateTrendingScrore = (post: IPost): number => {
    const currentTime = new Date().getTime();
    const postTime = post.createdAt?.getTime() || 0;

    const timeDifference = (currentTime - postTime) / (1000 * 60 * 60 * 24);

    let interactionScore = 0;

    interactionScore += post.interactions.clicked * EVENT_TYPE_STRENGTH.IS_CLICKED;
    interactionScore += post.interactions.profileClicked * EVENT_TYPE_STRENGTH.IS_PROFILE_CLICKED;
    interactionScore += post.interactions.likes * EVENT_TYPE_STRENGTH.IS_LIKED;
    interactionScore += post.interactions.comments * EVENT_TYPE_STRENGTH.IS_COMMENTED;
    interactionScore += post.interactions.shares * EVENT_TYPE_STRENGTH.IS_SHARED;
    interactionScore += post.interactions.bookmarked * EVENT_TYPE_STRENGTH.IS_BOOKMARKED;
    interactionScore += post.interactions.photoExpanded * EVENT_TYPE_STRENGTH.IS_PHOTO_EXPANDED;
    interactionScore += post.interactions.videoPlayback * EVENT_TYPE_STRENGTH.IS_VIDEO_PLAYBACK;

    const trendingScore = interactionScore * Math.exp(-DECAY_RATE * timeDifference);

    return sigmoid(trendingScore);
};

export const updateTrendingScore = async (): Promise<void> => {
    const posts = await PostCollection.find({});

    posts.forEach(async (post, index) => {
        const trendingScore = calculateTrendingScrore(post);
        console.log(`Post ${index + 1} - ${trendingScore}`);

        const res = await PostCollection.findOneAndUpdate(
            { _id: post._id },
            { trendingScore: trendingScore },
            { includeResultMetadata: true }
        );
        const postData = res.value;

        if (postData) {
            const mappedPostData = postData.toClient();
            const esClient = getEs();

            await esClient.update({
            	index: POST_INDEX,
            	id: mappedPostData.id!.toString(),
            	doc: {
            		...mappedPostData,
                    trendingScore: trendingScore,
            	},
            });
        }
    });
};