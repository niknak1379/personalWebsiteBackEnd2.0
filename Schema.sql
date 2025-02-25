CREATE DATABASE Projects;
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
END$$
DELIMITER ;

INSERT INTO Projects VALUES
('nik', 'longs d fs sdj ds ', 'Complete', 'pic url', 'git url', 'dep url');

INSERT INTO ProjectTags(name, tag) VALUES 
('nik', "PYTHON"),
('nik', "WEBDEV");

