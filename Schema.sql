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
    name varchar(255) NOT NULL,
    description TEXT NOT NULL,
    status varchar(255) NOT NULL,
    pictureURL TEXT,
    githubURL TEXT,
    deploymentURL TEXT,
    PRIMARY KEY (name),
    FOREIGN KEY (status) REFERENCES Status(status)
);

CREATE TABLE ProjectTags (
    name varchar(255) NOT NULL,
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
("Nikan's Personal Website V1", "My very own personal website, Showcasing my Projects and interests. Deployed on Vercel", 'Complete', 'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/personalSS.avif', 'https://github.com/niknak1379/personalWebsite', 'https://nikanostovan.dev/'),
("Persian American Student Association's Website", "Website Showcasing the student organization, its members, events and projects", 'Complete', 'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/PASA-SS.avif', 'https://github.com/niknak1379/pasa-website', 'https://pasa.org/'),
("Personal Home Lab", "Features currently include: PiHole for network wide adblock, Home-Assistant for IoT management", 'Complete', 'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/PASA-SS.avif', 'https://github.com/niknak1379/pasa-website', 'https://pasa.org/'),
("Nikan's Personal Website V2", "My very own personal website, Showcasing my Projects and interests. Deployed on AWS, using more sophisticated networking approaches.", 'In Progress', 'https://www.nikanostovan.dev/Assets/App/Cards/ProjectPics/personalSS.avif', 'https://github.com/niknak1379/personalWebsite2.0', 'https://nikanostovan.dev/');


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
("Persian American Student Association's Website", "React"),
("Persian American Student Association's Website", "Tailwind"),
("Persian American Student Association's Website", "FrontEnd");

INSERT INTO ProjectTags(name, tag) VALUES 
("Personal Home Lab", "Raspberry-Pi"),
("Personal Home Lab", "Linux"),
("Personal Home Lab", "IT"),
("Personal Home Lab", "Networking");