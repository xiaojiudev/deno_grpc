const PYTHON3_ENV_PATH = "C:/Program Files/Python36/python.exe";
const FILE_EXEC_PATH = "./apply_collaborative_filtering.py";
const DATASET_PATH = "./test.data";
const DEFAULT_RECOMMEND_TOP_N = "3";
const USER_ID = "c";


const command = new Deno.Command(PYTHON3_ENV_PATH, {
    args: [FILE_EXEC_PATH, USER_ID, DATASET_PATH, DEFAULT_RECOMMEND_TOP_N],
});
const { code, stdout, stderr } = await command.output();

console.log(new TextDecoder().decode(stdout));
console.log(new TextDecoder().decode(stderr));