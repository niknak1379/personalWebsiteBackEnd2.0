USE Projects;

CREATE TABLE Users (
    name varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    refreshToken varchar(255) NULL
);

INSERT INTO Users VALUES
('nikan', '$2b$10$KVBlu6xO4.ur8QNjtGM2Gu2c.1k1lT89X28tEO3MuX2cDXR.KbMky', NULL),
('102046077891560748914', 'a', NULL);


CREATE TABLE Status (
    status varchar(255) NOT NULL,
    PRIMARY KEY (status)
);

CREATE TABLE Tags (
    tag varchar(255) NOT NULL,
    PRIMARY KEY (tag)
);

CREATE TABLE Projects (
    name varchar(28) NOT NULL,
    description varchar(135) NOT NULL,
    longDescription Text NOT NULL,
    status varchar(255) NOT NULL,
    pictureURL varchar(255),
    githubURL varchar(255),
    deploymentURL varchar(255),
    obsidianURL varchar(255),
    carouselImage_1 varchar(255),
    carouselImage_2 varchar(255),
    carouselImage_3 varchar(255),
    PRIMARY KEY (name),
    FOREIGN KEY (status) REFERENCES Status(status)
);

CREATE TABLE ProjectTags (
    name varchar(28) NOT NULL,
    tag varchar(255) NOT NULL,
    FOREIGN KEY (name) REFERENCES Projects(name),
    FOREIGN KEY (tag) REFERENCES Tags(tag)
);

INSERT INTO Status (status) VALUES 
("Complete"),
("In Progress"),
("To Be Started");

DELIMITER $$
CREATE TRIGGER updateTag
BEFORE INSERT ON ProjectTags
FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE tag = new.tag) THEN
        INSERT INTO Tags(tag)
        VALUES (new.tag);
    END IF;
END $$

CREATE TRIGGER validStatus
BEFORE INSERT ON Projects
FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT status FROM Status WHERE status = new.status) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid status';  
    END IF;
END $$

CREATE TRIGGER defaultTag
AFTER INSERT ON Projects
FOR EACH ROW
BEGIN
    INSERT INTO ProjectTags
    VALUES(new.name, 'ALL');
END $$
DELIMITER ;

INSERT INTO Projects VALUES
("Nikan's Personal Website V1", 
'My very own personal website, Showcasing my Projects and interests. Deployed on Vercel, using mostly vanilla JS and some React', 
"My very own personal website, Showcasing my Projects and interests. Deployed on Vercel, using mostly vanilla JS and some React,
Mostly used Vanilla JS in order to learn JS fundamentals and JS event loop and basic API implementations, and service workers. Only used some react on
the main page to familiarize myself with the syntax and how it works. Backend for emailing and contact information processing is written with Express.js and hosted on Vercell",
'Complete', 
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/mainLight.avif', 
'https://github.com/niknak1379/personalWebsite', 
'https://nikanostovan.dev/',
'https://notes.nikanostovan.dev/',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/mainDark.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/projects.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/contactMe.avif'),
("PASA club's Website", 
'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.', 
"Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.
It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, 
will most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.
Also if you are reading this please donate to the club through the venmo link it is much appreciated :)",
'Complete', 
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainLight.avif', 
'https://github.com/niknak1379/pasa-website', 
'https://pasaatucsd.com/',
'https://notes.nikanostovan.dev/',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainDark.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/venmo.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/page.avif'),

("Personal Home Lab(ish)", 
'Features currently include: PiHole for network wide adblock, Home-Assistant for IoT management, will add NAS and other functinoaliteis', 
"My Personal Homelab currently running on 2 different Raspberry-pis. One running Home-Assistant for IoT management and the other PiHole for network wide adblock. 
will mostlikely add NAS and other functinoaliteis if I need more space for storing images and photography related files.
",
'Complete', 
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/homeLab/homelab.avif', 
'https://github.com/niknak1379/pasa-website', 
'https://pasaatucsd.org/',
'https://notes.nikanostovan.dev/',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/homeLab/PH.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/homeLab/HA.avif',
'CarouselURL 3 goes here'),

("Nikan's Personal Website V2", 
'My very own personal website, Showcasing my Projects and interests. Deployed on AWS, using more sophisticated networking approaches.', 
"My very own personal website, Showcasing my Projects and interests. Backend used for storing the database containing the projects and 
contacting and email functinality is written in Express.js and hosted on Docker containers on an AWS EC2 instance. Assets are stored in S3 buckets. Migrated the majority of the vanilla HTML and JS
to react to further familiarize myself with the framework and how it interacts with server side APIs. The app is client side rendered completely.",
'In Progress', 
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/mainPage.avif', 
'https://github.com/niknak1379/personalWebsite2.0', 
'https://nikanostovan.dev/',
'https://notes.nikanostovan.dev/',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/detailPage.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/contactForm.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/projectsPage.avif'),

("Obsidian Notes and Blog", 
'My obsidian Vault which contains the notes I have taken on the concepts I have learned, and blog like articles for my own use.', 
"My obsidian Vault which contains the notes I have taken on the concepts I have learned, and blog like articles for my own use.
Hosted on GitHub Pages using Quartz V4.0. Further documentation of future projects and their research notes will be on publicly 
published on here.",
'Complete', 
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/1.avif', 
'https://github.com/niknak1379/ObsidianNotes', 
'https://notes.nikanostovan.dev/',
'https://notes.nikanostovan.dev/',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/2.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/3.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/4.avif'),

("Nikan's Personal Website V3", 
'Third iteration of my Website, adding frontend for manipulating the backend DB. Using Multen and OAuth', 
"Third iteration of my Website, adding frontend for manipulating the backend DB. Using Multen and OAuth.
Adds a personal dashbord for myself to manipulate the projects individually and to insert new projects into the 
website without having to manually mainipulate the database instance on the EC2.",
'To Be Started', 
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/mainPage.avif', 
'https://github.com/niknak1379/personalWebsite2.0', 
'https://nikanostovan.dev/',
'https://notes.nikanostovan.dev/',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/detailPage.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/contactForm.avif',
'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/projectsPage.avif');


INSERT INTO ProjectTags(name, tag) VALUES 
("Nikan's Personal Website V1", "Javascript"),
("Nikan's Personal Website V1", "FrontEnd"),
("Nikan's Personal Website V2", "Javascript"),
("Nikan's Personal Website V2", "FrontEnd"),
("Nikan's Personal Website V2", "BackEnd"),
("Nikan's Personal Website V2", "MySQL"),
("Nikan's Personal Website V2", "AWS"),
("Nikan's Personal Website V2", "Networking"),
("PASA club's Website", "React"),
("PASA club's Website", "Tailwind"),
("PASA club's Website", "FrontEnd"),
("Personal Home Lab(ish)", "Raspberry-Pi"),
("Personal Home Lab(ish)", "Linux"),
("Personal Home Lab(ish)", "IT"),
("Personal Home Lab(ish)", "Networking"),
("Nikan's Personal Website V3", "AWS"),
("Nikan's Personal Website V3", "OAuth"),
("Obsidian Notes and Blog", "Github Pages");
