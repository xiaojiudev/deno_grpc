import { getPostsCollection, PostSchema } from "../model/PostSchema.ts";
import { getEs } from "../db/elasticsearch.ts";
import { getWordBagCollection } from "../model/WordBagSchema.ts";

const DECAY_RATE = 0.95;

const event_type_strength = {
	isVideoPlayback: 0.01,
	isPhotoExpanded: 0.02,
	isClicked: 0.2,
	isLiked: 0.3,
	isProfileClicked: 0.5,
	isBookmarked: 0.6,
	isShared: 0.9,
	isCommented: 1.0,
};

const calculateTrendingScrore = (post: PostSchema): number => {
	const currentTime = new Date().getTime();
	const postTime = post.createdAt?.getTime() || 0;

	const timeDifference = (currentTime - postTime) / (1000 * 60 * 60);

	let interactionScore = 0;

	interactionScore += post.interactions.clicked * event_type_strength.isClicked;
	interactionScore += post.interactions.profileClicked * event_type_strength.isProfileClicked;
	interactionScore += post.interactions.likes * event_type_strength.isLiked;
	interactionScore += post.interactions.comments * event_type_strength.isCommented;
	interactionScore += post.interactions.shares * event_type_strength.isShared;
	interactionScore += post.interactions.bookmarked * event_type_strength.isBookmarked;
	interactionScore += post.interactions.photoExpanded * event_type_strength.isPhotoExpanded;
	interactionScore += post.interactions.videoPlayback * event_type_strength.isVideoPlayback;

	const trendingScore = interactionScore / Math.pow(timeDifference + 1, DECAY_RATE);

	return trendingScore;
};

export const updateTrendingScore = async (): Promise<void> => {
	const PostCollection = await getPostsCollection();

	const posts = await PostCollection.find({}).toArray();

	posts.forEach(async (post, index) => {
		const trendingScore = calculateTrendingScrore(post);
		console.log(`Post ${index + 1} - ${trendingScore}`);

		await PostCollection.updateOne(
			{ _id: post._id },
			{ $set: { trendingScore: trendingScore } },
		);

		const esClient = getEs();

		const { _id, ...newPost } = post;

		await esClient.update({
			index: "posts",
			id: _id!.toString(),
			doc: {
				id: _id!.toString(),
				...newPost,
				trendingScore: trendingScore,
			},
			doc_as_upsert: true,
		});
	});
};

export const syncWordBagToEs = async (): Promise<void> => {
	const WordBagCollection = await getWordBagCollection();
	const data = await WordBagCollection.find({}).toArray();
	data.forEach(async (word) => {
		const payload = {
			id: word._id?.toString()!,
			word: word.word,
			dateCount: word.dateCount,
			totalCount: word.totalCount,
		};

		console.log(`wordbag ${word.word} - ${word.totalCount}`);
		
		const esClient = getEs();
		// await esClient.indices.delete({ index: "wordbag" });
		await esClient.update({
			index: "wordbag",
			id: payload.id,
			doc: payload,
			doc_as_upsert: true,
		});
	});
};
