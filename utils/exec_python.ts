const PYTHON3_ENV_PATH = "C:/Program Files/Python36/python.exe";
const FILE_EXEC_PATH = "./apply_code.py";
const USER_ID = "3";

const command = new Deno.Command(PYTHON3_ENV_PATH, {
    args: [FILE_EXEC_PATH, USER_ID],
});
const { code, stdout, stderr } = await command.output();
console.log(new TextDecoder().decode(stdout));
console.log(new TextDecoder().decode(stderr));