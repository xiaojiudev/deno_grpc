export interface SocialMediaService {
    CreatePost(request: Post): Promise<PostResponse>;
    UpdatePost(request: Post): Promise<PostResponse>;
    DeletePost(request: PostRequest): Promise<PostResponse>;
    GetPost(request: PostRequest): Promise<Post>;
    ListPost(request: Empty): Promise<PostList>;
    ListTrendingPosts(request: Empty): Promise<PostList>;
    ListTrendingKeywords(request: Empty): Promise<KeywordList>;
    RecommendPosts(request: UserRequest): Promise<PostList>;
}

export interface Post {
    _id?: string
    title: string
    content: string
    categories: string[]
    interactions?: Interaction
    trendingScore?: number
    createdAt?: string
    updatedAt?: string
}

export interface Interaction {
    likes: number
    comments: number
    shares: number
    clicked: number
    profileClicked: number
    bookmarked: number
    photoExpanded: number
    videoPlayback: number
}

export interface PostRequest {
    _id: string
}

export interface PostResponse {
    success: boolean
    message: string
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
    userId: string
}