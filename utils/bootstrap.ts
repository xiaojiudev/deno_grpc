import { parse } from "npm:yaml";

function loadLocalConfig(): Record<string, unknown> {
	const yamlData = Deno.readTextFileSync("./local.yaml");
	return parse(yamlData) as Record<string, unknown>;
}

const config = loadLocalConfig();

const env = config.env as { name: string; value: string | number }[];

export const APP_GRPC_PORT: number = env.find((e) => e.name === "APP_GRPC_PORT")
	?.value as number;

export const APP_DATABASE_URI: string = env.find((e) =>
	e.name === "APP_DATASOURCE_URI"
)
	?.value as string;

export const APP_DATABASE_NAME: string = env.find((e) =>
	e.name === "APP_DATABASE_NAME"
)
	?.value as string;

export const APP_ELASTICSEARCH_URI: string = env.find((e) =>
	e.name === "APP_ELASTICSEARCH_URI"
)
	?.value as string;

export const APP_ELASTICSEARCH_NAME: string = env.find((e) =>
	e.name === "APP_ELASTICSEARCH_NAME"
)
	?.value as string;

export const APP_ELASTICSEARCH_PW: string = env.find((e) =>
	e.name === "APP_ELASTICSEARCH_PW"
)
	?.value as string;
