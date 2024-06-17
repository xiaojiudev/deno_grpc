import sys
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


def recommend_posts(user_id, file_path="./dataset.data", top_n=3):
    # Define the column names for the dataset.
    header = ['user_id', 'category', 'liked', 'timestamp']

    # Load the dataset from a file, specifying that columns are separated by tabs and
    # assigning the column names defined earlier.
    dataset = pd.read_csv(file_path, sep='\t', names=header)

    # Replace missing values ('?') with NaN and then fill NaN with 0
    dataset['liked'] = pd.to_numeric(dataset['liked'], errors='coerce').fillna(0)

    n_users = dataset.user_id.unique().shape[0]
    n_posts = dataset['category'].max()

    A = np.zeros((n_users, n_posts))

    for line in dataset.itertuples():
        A[line[1] - 1, line[2] - 1] = line[3]

    # Compute item-item similarity
    item_similarity = cosine_similarity(A.T)

    user_interactions = np.array(dataset[dataset['user_id'] == user_id].liked.tolist())

    if user_interactions.size == 0:
        print(f"No interactions found for user {user_id}.")
        return []

    item_scores = user_interactions.dot(item_similarity)

    # Sort items by score and recommend the top-n
    recommended_items = np.argsort(item_scores)[::-1][:top_n]

    recommended_result = []

    # Display recommendations
    for item in recommended_items:
        if user_interactions[item] != 1:
            item_id = item + 1
            recommended_result.append(item_id)

    return recommended_result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a user_id as an argument.")
        sys.exit(1)

    user_id = int(sys.argv[1])
    recommendations = recommend_posts(user_id)
    print("Recommended Items: ", recommendations)