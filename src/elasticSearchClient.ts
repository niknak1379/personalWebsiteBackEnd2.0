// elasticsearchClient.js
import { Client } from "@opensearch-project/opensearch";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const elasticClient = new Client({
	node: process.env.SEARCH_ENDPOINT, // e.g. https://search-xxxx.us-west-2.es.amazonaws.com
	auth: {
		username: process.env.SEARCH_USER,
		password: process.env.SEARCH_PASS,
	},
	ssl: {
		rejectUnauthorized: false, // allows self-signed AWS certs
	},
	agent: new https.Agent({ keepAlive: true }),
});

export default elasticClient;
