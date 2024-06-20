export interface RequestAgrs {
    DATASET_PATH: string;
    CATEGORY_LIST: string[];
    USER_ID: string;
    RECOMMEND_TOP_N: number;
}

const PYTHON3_ENV_PATH: string = "C:/Program Files/Python36/python.exe";
const FILE_EXEC_PATH: string = "./python/apply_collaborative_filtering.py";

export const getRecommendationPosts = async (request: RequestAgrs) => {
    const { DATASET_PATH, CATEGORY_LIST, USER_ID, RECOMMEND_TOP_N } = request;

    const mappedAgrs = [
        FILE_EXEC_PATH,
        DATASET_PATH,
        JSON.stringify(CATEGORY_LIST),
        USER_ID.toString(),
        RECOMMEND_TOP_N.toString(),
    ];

    const options: Deno.CommandOptions = {
        args: [...mappedAgrs],
    }

    const command = new Deno.Command(PYTHON3_ENV_PATH, options);
    const { code, stdout, stderr } = await command.output();

    const result: string[] = JSON.parse(new TextDecoder().decode(stdout));
    
    const errorMessage: string = new TextDecoder().decode(stderr);
    console.log(errorMessage);

    return result;
}