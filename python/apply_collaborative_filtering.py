import json
import sys
import time

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os.path
from typing import List


def recommend_posts(file_path: str, categories_dataset: List[str], user_id: str, top_n=3) -> List[str]:
    # Define the column names for the dataset.
    header_name = ['user_id', 'category', 'liked', 'timestamp']

    # Load the dataset
    if os.path.isfile(file_path):
        dataset = pd.read_csv(file_path,
                              sep='\t',
                              names=header_name,
                              dtype={'user_id': str, 'category': str, 'liked': bool, 'timestamp': int})
    else:
        dataset = pd.read_csv("./test.data",
                              sep='\t',
                              names=header_name,
                              dtype={'user_id': str, 'category': str, 'liked': bool, 'timestamp': int})

    # Replace missing values ('?') with NaN and then fill NaN with 0
    dataset['liked'] = pd.to_numeric(dataset['liked'], errors='coerce').fillna(0)

    unique_users = dataset['user_id'].unique()
    if user_id not in unique_users:
        return []

    # Create a DataFrame to ensure every user has an entry for every category
    all_combinations = pd.MultiIndex.from_product([unique_users, categories_dataset], names=['user_id', 'category'])
    complete_dataset = pd.DataFrame(index=all_combinations).reset_index()

    # Merge with the original dataset to fill missing values
    complete_dataset = complete_dataset.merge(dataset, on=['user_id', 'category'], how='left').fillna(0)
    complete_dataset['liked'] = complete_dataset['liked'].astype(int)
    complete_dataset['timestamp'] = complete_dataset['timestamp'].replace(0, time.time() * 1000)

    user_index = {user: idx for idx, user in enumerate(unique_users)}
    category_index = {category: idx for idx, category in enumerate(categories_dataset)}

    n_users = len(unique_users)
    n_categories = len(categories_dataset)

    A = np.zeros((n_users, n_categories))

    for line in complete_dataset.itertuples():
        user_idx = user_index[line[1]]
        category_idx = category_index[line[2]]
        A[user_idx, category_idx] = line[3]

    # Compute item-item similarity
    item_similarity = cosine_similarity(A.T)
    # print("item_similarity\n", item_similarity)
    # Output:
    # [[1.         0.         0.81649658 0.70710678]
    # [0.         0.         0.         0.        ]
    # [0.81649658 0.         1.         0.57735027]
    # [0.70710678 0.         0.57735027 1.        ]]

    # Extract user's interaction in the dataset
    user_interactions = np.array(complete_dataset[complete_dataset['user_id'] == user_id].liked.tolist())
    # print("user interactions", user_interactions)
    # Output:
    # [0 0 1 0]

    if user_interactions.size == 0:
        print(f"No interactions found for user {user_id}.")
        return []

    # Calculate item scores based on user's interactions and item similarity.
    # First column      0*1 + 0*0 + 1*0.816 + 0*0.707 = 0.816
    # Second column     0*0 + 0*0 + 1*0 + 0*0 = 0
    # Third column      0*0.816 + 0*0 + 1*1 + 0*0.577 = 1
    # Fourth column     0*0.707 + 0*0 + 1*0.577 + 0*1 = 0.577
    # => [0.816     0    1   0.577]
    item_scores = user_interactions.dot(item_similarity)
    # print("item_scores\n", item_scores)
    # Output:
    # [0.81649658 0.         1.         0.57735027]

    # Sort items by score and recommend the top-n + 1, because the first element is the same post and always is 1
    recommended_items = np.argsort(item_scores)[::-1][:top_n + 1]

    recommended_result = []

    # Append result into recommended_result array
    for item in recommended_items:
        if user_interactions[item] != 1:
            item_id = categories_dataset[item]
            recommended_result.append(item_id)

    return recommended_result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a user_id as an argument.")
        sys.exit(1)

    dataset_path = str(sys.argv[1])
    categories = json.loads(sys.argv[2])
    user_id = str(sys.argv[3])
    recommend_top_n = int(sys.argv[4])
    recommendations = recommend_posts(dataset_path, categories, user_id, recommend_top_n)
    print(json.dumps(recommendations))

# categories = ['cate1', 'cate2', 'cate3', 'cate4', ]
# print(recommend_posts("../dataset/test.data", categories, "c"))
# print(recommend_posts("../dataset/test1.data", categories, "c"))
# print(recommend_posts("../dataset/dataset.data", categories, "3"))
# print(recommend_posts("../dataset/dataset1.data", categories, "3"))
