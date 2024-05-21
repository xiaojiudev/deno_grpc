import { ObjectId } from "../deps.ts";

export interface SocialMediaService {
    CreatePost(request: Post): Promise<PostResponse>;
    GetPost(request: PostRequest): Promise<Post>;
    UpdatePost(request: Post): Promise<PostResponse>;
    DeletePost(request: PostRequest): Promise<PostResponse>;
    ListPost(request: Empty): Promise<Empty>;
    ListTrendingPosts(request: Empty): Promise<PostList>;
    ListTrendingKeywords(request: Empty): Promise<KeywordList>;
    RecommendPosts(request: UserRequest): Promise<PostList>;
}

export interface Post {
    id?: ObjectId
    title: string
    content: string
    tags: string[]
}

export interface PostRequest {
    id: ObjectId
}

export interface PostResponse {
    success: boolean
}

// deno-lint-ignore no-empty-interface
export interface Empty { }

export interface PostList {
    posts: Post[]
}

export interface KeywordList {
    keywords: string[]
}

export interface UserRequest {
    userId: ObjectId
}