USE Projects;

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
'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/personalSS.avif', 
'https://github.com/niknak1379/personalWebsite', 
'https://nikanostovan.dev/',
'https://notes.nikanostovan.dev/',
'CarouselURL 1 goes here',
'CarouselURL 2 goes here',
'CarouselURL 3 goes here'),
("PASA club's Website", 
'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.', 
"Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.
It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, 
will most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project",
'Complete', 
'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/PASA-SS.avif', 
'https://github.com/niknak1379/pasa-website', 
'https://pasa.org/',
'https://notes.nikanostovan.dev/',
'CarouselURL 1 goes here',
'CarouselURL 2 goes here',
'CarouselURL 3 goes here'),
("Personal Home Lab", 
'Features currently include: PiHole for network wide adblock, Home-Assistant for IoT management, will add NAS and other functinoaliteis', 
"My Personal Homelab currently running on 2 different Raspberry-pis. One running Home-Assistant for IoT management and the other PiHole for network wide adblock. 
will mostlikely add NAS and other functinoaliteis if I need more space for storing images and photography related files.
",
'Complete', 
'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/PASA-SS.avif', 
'https://github.com/niknak1379/pasa-website', 
'https://pasaatucsd.org/',
'https://notes.nikanostovan.dev/',
'CarouselURL 1 goes here',
'CarouselURL 2 goes here',
'CarouselURL 3 goes here'),
("Nikan's Personal Website V2", 
'My very own personal website, Showcasing my Projects and interests. Deployed on AWS, using more sophisticated networking approaches.', 
"My very own personal website, Showcasing my Projects and interests. Backend used for storing the database containing the projects and 
contacting and email functinality is written in Express.js and hosted on Docker containers in AWS. Migrated the majority of the vanilla HTML and JS
to react to further familiarize myself with the framework and how it interacts with server side APIs. The app is client side rendered completely.",
'In Progress', 
'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/personalSS.avif', 
'https://github.com/niknak1379/personalWebsite2.0', 
'https://nikanostovan.dev/',
'https://notes.nikanostovan.dev/',
'CarouselURL 1 goes here',
'CarouselURL 2 goes here',
'CarouselURL 3 goes here');


INSERT INTO ProjectTags(name, tag) VALUES 
("Nikan's Personal Website V1", "Javascript"),
("Nikan's Personal Website V1", "FrontEnd");

INSERT INTO ProjectTags(name, tag) VALUES 
("Nikan's Personal Website V2", "Javascript"),
("Nikan's Personal Website V2", "FrontEnd"),
("Nikan's Personal Website V2", "BackEnd"),
("Nikan's Personal Website V2", "MySQL"),
("Nikan's Personal Website V2", "AWS"),
("Nikan's Personal Website V2", "Networking");

INSERT INTO ProjectTags(name, tag) VALUES 
("PASA club's Website", "React"),
("PASA club's Website", "Tailwind"),
("PASA club's Website", "FrontEnd");

INSERT INTO ProjectTags(name, tag) VALUES 
("Personal Home Lab", "Raspberry-Pi"),
("Personal Home Lab", "Linux"),
("Personal Home Lab", "IT"),
("Personal Home Lab", "Networking");