## Project Descriptions

This project using Deno to write GRPC api service with CQRS model to support social networks with keyword suggestion or hot posts feature.

**Note:** Hono framework [hasn't supported Deno.listen](#issues-note) for listen a connection yet. So this project will implememted with Deno and grpc_basic library (limited features).

1. Api CRUD posts (title: string, content: string, tags:[string],...).
2. Research the algorithm to calculate the increase or decrease in trend of an posts or keyword (trend must gradually decrease over time).
3. The API retrieves a list of the top 10 hottest posts.
4. The API retrieves a list of the top 10 most searched keywords.
5. The API retrieves a list of the top 10 most suitable posts suggested for a user.

## Tech Stack

- Deno, gRPC, CQRS pattern, Mongoose/MongoDB, Elasticsearch, Typescript, etc.

## My Solution

### Task 1 - Api CRUD posts

    1. Define Proto's Post schema (./protos/social_media.proto).
    2. Define Mongo's Post schema (./model/PostSchema.ts).
    3. Setup gRPC server, connect to MongoDB, connect to Elasticsearch.
    4. Implement CRUD action.
    5. Sync data to Elasticsearch for fast retrieve posts opeations.

### Task 2 - Calculating trending algorithm

` interaction_score = interaction_count * event_weigth `

- Event weights:
    - isVideoPlayback: 0.01
    - isPhotoExpanded: 0.02
    - isClicked: 0.2
    - isLiked: 0.3
    - isProfileClicked: 0.5
    - isBookmarked: 0.6
    - isShared: 0.9
    - isCommented: 1.0

` trending_score = sigmoid(interaction_score * e^(-decay_score * time)) `

<p align="center">
  <img src="https://quicklatex.com/cache3/96/ql_d72477ac525b24f61f1b62fd2acf6596_l3.png" alt="Sigmoid formula"/>
</p>

``` decay_score = 0.95```

**Note:** I also use `Deno.CronJob` to calculate and sync trending score to  Elasticsearch every xx minutes. This will be helpfull for fast retrieving the top hot posts in the big data contexts.

### Task 3 - Top 10 hot posts

- Based on `Task 2`, using elasticsearch query to retrieve top 10 posts in the last 7 days and sort them by descending trending score.

### Task 4 - Top 10 hot search keywords

1. Beside retrieve data, also store the keywords when user use search operation.
2. Use elasticsearch's aggregation to retrieve the top 10 hot search keywords in the last 1 day.

### Task 5 - Top 10 recommended posts for a user

- My strategy:
    - Based on user_id and user_favorite_categories, apply `Item-Item Collaborative Filtering` method to retrieve top 10 recommended posts.


- Cosine similarity: Calculate the similarity between all the item pairs.

<!-- ![Cosine similarity!](https://miro.medium.com/v2/resize:fit:1022/1*-0AjCAVpOI50XySKLCt_Bg.png) -->

<p align="center">
  <img src="https://miro.medium.com/v2/resize:fit:1022/1*-0AjCAVpOI50XySKLCt_Bg.png" alt="Cosine similarity"/>
</p>

- Prediction computation:
    - Given the `user_interactions` and the item `similarity_matrix`
        - Example `user_interactions` vector, i.e., list of categories that the user liked: ```[0 0 1 0]```
        - Item `similarity_matrix`:
        ```
        [[1.        0.         0.81649658 0.70710678]
        [0.         0.         0.         0.        ]
        [0.81649658 0.         1.         0.57735027]
        [0.70710678 0.         0.57735027 1.        ]]
        ```
    - Multiply each row of `item_similarity` by the corresponding element in `user_interactions` and sum them up for each column
    - Combine the results to get the vectors:  ```[0.81649658    0    1.    0.57735027]``` <=> ```[category1    category2    category3    category4]```
    - Sort and get the recommendation results: ```category3 > category1 > category 4 > category2```
    <!-- - Making Recommendations
    - ![Prediction computation!](https://quicklatex.com/cache3/cf/ql_c29dcade44fd0c18bd9a990406d05ccf_l3.png) -->

## Issues Note

**grpc/grpc-js hasn't supported Deno (typescript) well**
- [npm:@grpc/grpc-js support for server-side](https://github.com/denoland/deno/issues/23714).

**Deno hasn't supported grpc server error/status response yet! See issues here:** 
- [Deno v1.44 only supports the client APIs](https://github.com/denoland/deno/issues/23714).
- [Add support for gRPC](https://github.com/denoland/deno/issues/3326).

**Hono framework hasn't supported Deno.listen for listen a connection yet! See issues here:**
- [Does Hono support for gRPC server/client with Deno runtime?](https://github.com/orgs/honojs/discussions/2903).