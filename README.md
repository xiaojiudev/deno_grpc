## Project Descriptions

This project using Hono framework to write GRPC api service with CQRS model to support social networks with keyword suggestion or hot posts feature
1. Api CRUD posts (title: string, content: string, tags:[string],...)
2. Research the algorithm to calculate the increase or decrease in trend of an posts or keyword (trend must gradually decrease over time)
3. The API retrieves a list of the top 10 hottest posts
4. The API retrieves a list of the top 10 most searched keywords
5. The API retrieves a list of the top 10 most suitable posts suggested for a user

## My Solution
### Task 1 - Api CRUD posts
    1. Define gRPC PostService Schema (./protos/social_media.proto)
    2. Define Post Schema for storing in MongoDB (./model/PostSchema.ts)
    3. Setup gRPC server, connect to MongoDB and connect to Elasticsearch
    4. Implement CRUD action for posts
    5. When an action is performed on a post, sync it to both MongoDB and Elasticsearch

### Task 2 - Calculating trending algorithm
- A post will have a property to count its interactions such as: likes, comments, shares, bookmarks, etc. Each event type has a corresponding weight, and I will sum the total of these weight multipiled by the respective count. I call this the `INTERACTION SCORE`.

- Additionally, the post's popularity needs to decrease overtime. I calculate the difference between the post's creation date and the current time, then apply an exponential decay using a **DECAY_RATE**. I call this the `DECAY SCORE`. Overall, to calculate trending score, I use the simple equation: 

<code>**Trending Score** = **Interaction Score** / **Decay Score**<code>


Event weights: 

    isVideoPlayback: 0.01
    isPhotoExpanded: 0.02
    isClicked: 0.2
    isLiked: 0.3
    isProfileClicked: 0.5
    isBookmarked: 0.6
    isShared: 0.9
    isCommented: 1.0

 DECAY RATE = 0.95

- *Note: I also use Deno.CronJob to calculate post's trending score every 30 minutes and sync the data into MongoDB and Elasticsearch. This will be helpfull when retrieving the top hot posts through the Elasticsearch Service.*


### Task 3 - Top 10 hot posts
- Since I have already synced the post's data into Elasticsearch, I just retrieve the top 10 posts and sort them by descending trending score.

### Task 4 - Top 10 hot search keywords
- To implement this feature, I will first define a schema to store keywords (./model/WordBagSchema.ts). 

WordBagSchema:

    id: ObjectId
    word: string
    dateCount: {
        date: Date
	    count: number
    }[]
    totalCount: number

- When a user search for something, besides retrieving the results, I also handle the user's search query. For a query string, I will split it into an array of words, then validate like removing whitespace, empty string and duplicate elements. Additionally, I also remove stopwords (words that carry very little information). Then I will loop through each word in word array, check it exists in WordBag database and save both date and count accordingly. I also sync the data into Elasticsearch.

- To retrieve the top 10 hot search keywords using Elasticsearch, I query the data prioritizing the current date (default range is 7 days) and the dateCount.count.

### Task 5 - Top 10 recommended posts for a user
My Strategies:

    + Popularity based (post's trending score) 
    + Classification based (post category & user favorite)

_Updating soon..._

## Tech Stack
- Deno, gRPC, CQRS pattern, MongoDB, Elasticsearch, Typescript, etc