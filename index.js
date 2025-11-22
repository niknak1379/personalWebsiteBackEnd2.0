import express from "express";
import {
  getAllStatus,
  getAllTags,
  getProjects,
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
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectAclCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sanitizer from "perfect-express-sanitizer";
import elasticClient from "./elasticSearchClient.js";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const INDEX_NAME = "projects";
app.use("/", auth);
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
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.send("DataBase Crashed :(");
});

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
app.get("/:name/:status/:tags/:numberRequested", async (req, res) => {
  //send in space for an empty paramter

  const { name, status, tags, numberRequested } = req.params;

  const searchQuery = name === " " ? "" : name;

  const statusArray =
    status === " "
      ? ["In Progress", "Complete", "To Be Started"]
      : status.split("-");

  const tagArray = tags === " " ? [] : tags.split("-");

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
  } //else {
  //query.bool.must.push({
  //	match_all: {},
  //});
  //}

  // filter by status (always applied)
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
  console.log("query", JSON.stringify(query));
  try {
    const result = await elasticClient.search({
      index: INDEX_NAME,
      size: Number(numberRequested) || 10,
      body: {
        query: query,
      },
    });
    console.log("result of query", result.body.hits);
    const projects = result.body.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }));

    projects.forEach((projectDetails) => {
      console.log("logging from inside the proj", projectDetails);
      projectDetails.pictureURL = toCDN(projectDetails.pictureURL);
      projectDetails.carouselImage_1 = toCDN(projectDetails.carouselImage_1);
      projectDetails.carouselImage_2 = toCDN(projectDetails.carouselImage_2);
      projectDetails.carouselImage_3 = toCDN(projectDetails.carouselImage_3);
    });
    console.log("logging batch returned projects from ES", projects);
    res.send(projects);
  } catch (error) {
    console.log("elastic search failed, in get", error);
    res.send("get failed, elastic Search node down", 500);
  }
});

/*
    Expected output strutcture:
    {
        longDescription: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.\n' +
            'It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, \n' +
            'will most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.\n' +
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
app.get("/projectDetails/:projectName", async (req, res) => {
  //const projectDetails = await getProjectDetails(req.params.projectName);
  //console.log('logging project details from get project',projectDetails)
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

  res.send(projectDetails);
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
app.get("/tags", async (req, res) => {
  const tags = await getAllTags();
  console.log(tags);
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
app.get("/status", async (req, res) => {
  const status = await getAllStatus();
  console.log(status);
  res.send(status);
});

const S3 = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

//need to also delete the s3 path of the project as well
app.delete("/:projectName", validateTokenMiddleware, async (req, res) => {
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
    })
  );
  console.log(s3message);
  let deletedProject = await deleteProject(req.params.projectName);
  console.log("logging deleted project", deletedProject);
  res.status(201).send("ok");
});

const projectImageFields = upload.fields([
  { name: "pictureURL" },
  { name: "carouselImage_1" },
  { name: "carouselImage_2" },
  { name: "carouselImage_3" },
]);

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
app.put(
  "/editProject",
  validateTokenMiddleware,
  projectImageFields,
  async (req, res) => {
    console.log("files", req.files);

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
      // Process each photo sequentially
      for (const photo of photoArr) {
        // Create FormData and add the file
        const formData = new FormData();
        const file = new File([photo.buffer], photo.originalname, {
          type: photo.mimetype,
        });
        formData.append(photo.fieldname, file);

        // Call resize and format API
        const response = await fetch("http://localhost:5000/changeFormat", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Format API returned ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const convertedImageBuffer = Buffer.from(arrayBuffer);

        // Upload to S3 with converted image
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key:
            process.env.S3_PROJECT_DIR +
            req.body.name +
            "/" +
            photo.fieldname +
            ".avif",
          Body: convertedImageBuffer,
          ContentType: "image/avif",
        });

        console.log("Uploading to S3:", command);
        await S3.send(command);

        // Store the S3 URL
        req.body[photo.fieldname] =
          process.env.S3_IMG_URL_PREFIX +
          req.body.name +
          `/${photo.fieldname}.avif`;

        console.log("After S3 upload:", req.body);
      }

      // Update project after all images are processed
      await updateProject(req.body);
      res.send("Project updated successfully");
    } catch (error) {
      console.log("Error:", error);
      res.status(500).send(`Error: ${error.message}`);
    }
  }
);
app.post(
  "/newProject",
  //validateTokenMiddleware,
  projectImageFields,
  async (req, res) => {
    console.log(req.files);

    let photoArr = [
      req.files.pictureURL[0],
      req.files.carouselImage_1[0],
      req.files.carouselImage_2[0],
      req.files.carouselImage_3[0],
    ];

    try {
      // Process each photo
      for (const photo of photoArr) {
        // Create FormData and add the file
        const formData = new FormData();
        const blob = new Blob([photo.buffer], { type: photo.mimetype });
        formData.append(photo.fieldname, blob, photo.originalname);

        // Call resize and format API
        const response = await fetch("http://localhost:5000/changeFormat", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Format API returned ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const convertedImageBuffer = Buffer.from(arrayBuffer);

        // Upload to S3 with converted image
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key:
            process.env.S3_PROJECT_DIR +
            req.body.name +
            "/" +
            photo.fieldname +
            ".avif",
          Body: convertedImageBuffer,
          ContentType: "image/avif",
        });

        console.log("Uploading to S3:", command);
        await S3.send(command);

        // Store the S3 URL
        req.body[photo.fieldname] =
          process.env.S3_IMG_URL_PREFIX +
          req.body.name +
          `/${photo.fieldname}.avif`;

        console.log("After S3 upload:", req.body);
      }

      // Insert project after all images are processed
      await insertProject(req.body);
      res.send("Project created successfully");
    } catch (error) {
      console.log("Error:", error);
      res.status(500).send(`Error: ${error.message}`);
    }
  }
);

app.get("/healthCheck", (req, res) => {
  res.send("healthy", 200);
});

app.listen(8080, () => {
  console.log("Server running on 8080");
});
