/* this code was generated by automated tool,
   should not edit by hand */

export interface UserService {
	CreateUser(request: CreateUserRequest): Promise<CreateUserResponse>;
}

export interface User {
	id?: string;
	username: string;
	password: string;
	createdAt?: string;
}

export interface CreateUserRequest {
	username: string;
	password: string;
}

export interface CreateUserResponse {
	success: boolean;
	message: string;
}
