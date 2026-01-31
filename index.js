import express from "express";
import {
	getAllStatus,
	getAllTags,
	insertProject,
	getProjectDetails,
	deleteProject,
	updateProject,
	toCDN,
} from "./database.js";
import { validateTokenMiddleware } from "./Routes/authentication.js";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import auth from "./Routes/authentication.js";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import logger from "./logger.js";
import elasticClient from "./elasticSearchClient.js";
const PORT = process.env.PORT;
const app = express();
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer(
	{ storage: storage },
	{ limits: { fileSize: 5 * 1024 * 1024 } },
); // 5MB limit);
const INDEX_NAME = "projects";
const ENV = process.env.PROD_ENV || "prod";
const prefix = ENV === "test" ? "/test" : "";

app.use(express.json());
/* app.use(
    sanitizer.clean({
      xss: true,
      sql: true,
      sqlLevel: 5,
    })
  ); */
var corsOptions = {
	origin: [
		"http://localhost:3000",
		"http://localhost:80",
		"https://www.nikanostovan.dev",
		"https://nikanostovan.dev",
		"https://test.www.nikanostovan.dev",
		"https://test.nikanostovan.dev",
	],
	credentials: true,
};
app.use(cors(corsOptions));
app.use(prefix, router);
app.use("/", auth);
app.use(cookieParser());
app.use((err, req, res, next) => {
	logger.error("Error Sth Crashed", { error: err.stack });
	res.send("DataBase Crashed :(");
});

const S3 = new S3Client({
	region: process.env.S3_BUCKET_REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	},
});

const projectImageFields = upload.fields([
	{ name: "pictureURL" },
	{ name: "carouselImage_1" },
	{ name: "carouselImage_2" },
	{ name: "carouselImage_3" },
]);

/*
expected returned data format, array of JSON objects in the following format
   [
    {
      "name": "nik",
      "description": "longs d fs sdj ds ",
      "status": "Complete",
      "pictureURL": "pic url",
      "githubURL": "git url",
      "deploymentURL": "dep url",
    }
    ]
*/
router.get(
	"/:name/:status/:tags/:numberRequested/:pageNumber",
	async (req, res) => {
		//send in space for an empty paramter

		const { name, status, tags, numberRequested, pageNumber } = req.params;

		const searchQuery = name === " " ? "" : name;

		const statusArray =
			status === " "
				? ["In Progress", "Complete", "To Be Started"]
				: status.split("-");

		const tagArray = tags === " " ? [] : tags.split("-");

		logger.info("get query coming in", {
			name: searchQuery,
			"status Array": statusArray,
			"tag array": tagArray,
			numberRequested: numberRequested,
			pageNumber: pageNumber,
		});
		const query = {
			bool: {
				must: [],
				should: [],
				filter: [],
			},
		};

		// full-text match on name, description, etc.
		if (searchQuery) {
			query.bool.must.push({
				multi_match: {
					query: searchQuery,
					fields: ["name", "description", "longDescription", "tags"],
					fuzziness: "AUTO",
				},
			});
		}

		// filter by status
		query.bool.filter.push({
			terms: {
				"status.keyword": statusArray,
			},
		});

		// filter by tags, if present and not ALL
		if (tagArray.length > 0 && !tagArray.includes("ALL")) {
			query.bool.filter.push({
				terms: {
					"tags.keyword": tagArray,
				},
			});
		}
		try {
			// https://github.com/opensearch-project/opensearch-js/blob/main/guides/search.md
			const result = await elasticClient.search({
				index: INDEX_NAME,
				from: Number(pageNumber),
				size: Number(numberRequested) || 10,
				body: {
					query: query,
					sort: [
						{
							creationDate: {
								order: "desc",
							},
							lastModified: {
								order: "desc",
							},
						},
					],
				},
			});
			const projects = result.body.hits.hits.map((hit) => ({
				id: hit._id,
				...hit._source,
				score: hit._score,
			}));

			projects.forEach((projectDetails) => {
				projectDetails.pictureURL = toCDN(projectDetails.pictureURL);
				projectDetails.carouselImage_1 = toCDN(projectDetails.carouselImage_1);
				projectDetails.carouselImage_2 = toCDN(projectDetails.carouselImage_2);
				projectDetails.carouselImage_3 = toCDN(projectDetails.carouselImage_3);
			});
			logger.info("query result", { result: projects });

			res.send({ projects: projects, totalHits: result.body.hits.total.value });
		} catch (error) {
			logger.error("elastic search failed, in get", { error: error });
			res.send("get failed, elastic Search node down").status(500);
		}
	},
);

/*
    Expected output strutcture:
    {
        longDescription: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.\n' +
            'It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, \n' +
            'well most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.\n' +
            'Also if you are reading this please donate to the club through the venmo link it is much appreciated :)',
        status: 'Complete',
        githubURL: 'https://github.com/niknak1379/pasa-website',
        deploymentURL: 'https://pasaatucsd.com/',
        pictureURL: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainLight.avif',
        carouselImage_1: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainDark.avif',
        carouselImage_2: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/venmo.avif',
        carouselImage_3: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/page.avif',
        obsidianURL: 'https://notes.nikanostovan.dev/',
        tags: [ 'ALL', 'React', 'Tailwind', 'FrontEnd' ]
    }
*/
router.get("/projectDetails/:projectName", async (req, res) => {
	//const projectDetails = await getProjectDetails(req.params.projectName);
	try {
		logger.info("getting project details for", {
			"project name": req.params.projectName,
		});
		let { body: currentDoc } = await elasticClient.get({
			index: INDEX_NAME,
			id: req.params.projectName,
		});
		//process urls and change to the CDN version
		let projectDetails = currentDoc._source;
		projectDetails.pictureURL = toCDN(projectDetails.pictureURL);
		projectDetails.carouselImage_1 = toCDN(projectDetails.carouselImage_1);
		projectDetails.carouselImage_2 = toCDN(projectDetails.carouselImage_2);
		projectDetails.carouselImage_3 = toCDN(projectDetails.carouselImage_3);

		logger.info("returned project details", {
			"project details": projectDetails,
		});
		res.send(projectDetails);
	} catch (e) {
		logger.error("get project details failed", { error: e });
		res.send(e).status(500);
	}
});
/*
expected returned data format, array of JSON objects in the following format
   [
    {
        "tag": 'tagName',
        "frequency": '1'
    }
    ]
*/
router.get("/tags", async (req, res) => {
	logger.info("getting all tags");
	const tags = await getAllTags();
	res.send(tags);
});
/*
expected returned data format, array of JSON objects in the following format
   [
    {
        "status": 'statusName',
        "frequency": '1'
    }
    ]
*/
router.get("/status", async (req, res) => {
	logger.info("getting all status");
	const status = await getAllStatus();
	res.send(status);
});

//need to also delete the s3 path of the project as well
router.delete("/:projectName", validateTokenMiddleware, async (req, res) => {
	logger.info("deleting project", { name: req.params.projectName });
	const projectDetails = await getProjectDetails(req.params.projectName);
	if (projectDetails == null) {
		res.status(403).send("project not found");
	}
	let { pictureURL, carouselImage_1, carouselImage_2, carouselImage_3 } =
		projectDetails;

	let pictures = [
		pictureURL,
		carouselImage_1,
		carouselImage_2,
		carouselImage_3,
	];
	let s3message = await S3.send(
		new DeleteObjectsCommand({
			Bucket: process.env.S3_BUCKET_NAME,
			Delete: {
				Objects: pictures.map((picture) => ({
					Key: picture.split(".com/")[1],
				})),
			},
		}),
	);
	logger.info("s3 delete result", { res: s3message });
	await deleteProject(req.params.projectName);
	console.log("deleted project");
	res.status(201).send("ok");
});

/*
        projectObject returned as the req.body
        picture links will have to be appended.
        {
            name: "PASA club's Website",
            description: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.',
            londDescription: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.\r\n' +
                'It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, \r\n' +
                'will most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.\r\n' +
                'Also if you are reading this please donate to the club through the venmo link it is much appreciated :)',
            githubURL: 'https://github.com/niknak1379/pasa-website',
            obsidianURL: 'https://notes.nikanostovan.dev/',
            deploymentURL: 'https://pasaatucsd.com/',
            tags: 'ALL-React-Tailwind-FrontEnd'
        }
         picture object structure
        {
            fieldname: 'picture',
            originalname: 'placeholder.avif',
            encoding: '7bit',
            mimetype: 'image/avif',
            buffer: <Buffer 00 00  00 f2 6d8 64 ... 826 more bytes>,
            size: 876
        }
    */
router.put(
	"/editProject",
	validateTokenMiddleware,
	projectImageFields,
	async (req, res) => {
		logger.info("updating project", { field: req.body });
		let filesArr = req.files
			? [
					req.files.pictureURL,
					req.files.carouselImage_1,
					req.files.carouselImage_2,
					req.files.carouselImage_3,
				]
			: [];

		let photoArr = [];
		filesArr.forEach((item) => {
			if (item != null) photoArr.push(item[0]);
		});

		try {
			const config = {
				region: "us-east-2",
				credentials: {
					accessKeyId: process.env.S3_ACCESS_KEY,
					secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
				},
			}; // type is LambdaClientConfig
			const client = new LambdaClient(config);

			// Process each photo
			for (const photo of photoArr) {
				let payloadContents = {
					data: photo.buffer.toString("base64"),
					fieldname: photo.fieldname,
					projectName: req.body.name,
				};
				const input = {
					FunctionName: "imageDecoder",
					InvocationType: "RequestResponse",
					Payload: JSON.stringify(payloadContents),
					LogType: "Tail",
				};
				const command = new InvokeCommand(input);
				const response = await client.send(command);
				if (response.StatusCode != 200) {
					throw new Error(`Format API returned ${response.FunctionError}`);
				}

				// Lambda returns just the S3 key/URL
				// it returns it in a Uint8ArrayBlobAdapter format so
				// has to be converted.
				const result = JSON.parse(Buffer.from(response.Payload).toString());
				req.body[photo.fieldname] = JSON.parse(result.body).url;

				logger.info(`Uploaded ${photo.fieldname}:`);
			}

			// Update project after all images are processed
			await updateProject(req.body);
			res.send("Project updated successfully");
		} catch (error) {
			logger.error("Error in update project", { error: error });
			res.status(500).send(`Error: ${error.message}`);
		}
	},
);
router.post(
	"/newProject",
	validateTokenMiddleware,
	projectImageFields,
	async (req, res) => {
		logger.info("adding new project", { fields: req.body });

		let photoArr = [
			req.files.pictureURL[0],
			req.files.carouselImage_1[0],
			req.files.carouselImage_2[0],
			req.files.carouselImage_3[0],
		];

		try {
			const config = {
				region: "us-east-2",
				credentials: {
					accessKeyId: process.env.S3_ACCESS_KEY,
					secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
				},
			}; // type is LambdaClientConfig
			const client = new LambdaClient(config);

			// Process each photo
			for (const photo of photoArr) {
				let payloadContents = {
					data: photo.buffer.toString("base64"),
					fieldname: photo.fieldname,
					projectName: req.body.name,
				};
				const input = {
					FunctionName: "imageDecoder",
					InvocationType: "RequestResponse",
					Payload: JSON.stringify(payloadContents),
					LogType: "Tail",
				};
				const command = new InvokeCommand(input);
				const response = await client.send(command);
				if (response.StatusCode != 200) {
					throw new Error(`Format API returned ${response.FunctionError}`);
				}

				// Lambda returns just the S3 key/URL
				// it returns it in a Uint8ArrayBlobAdapter format so
				// has to be converted.
				const result = JSON.parse(Buffer.from(response.Payload).toString());
				// console.log("result objects:", result, result.body);
				// Store the S3 URL in req.body to be pased to the DB
				req.body[photo.fieldname] = JSON.parse(result.body).url;

				console.log(`Uploaded ${photo.fieldname}:`, req.body[photo.fieldname]);
			}

			// Insert project after all images are processed
			await insertProject(req.body);
			res.send("Project created successfully");
		} catch (error) {
			logger.error("Error in adding project", { error: error });
			res.status(500).send(`Error: ${error.message}`);
		}
	},
);

router.get("/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		service: "PW " + process.env.PROD_ENV,
	});
});

app.listen(PORT, () => {
	logger.info("Server running on " + PORT, {
		"prod env": process.env.PROD_ENV,
	});
});
