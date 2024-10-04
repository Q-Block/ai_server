CREATE TABLE USER (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,  
    username VARCHAR(50) NOT NULL,              
    email VARCHAR(100) NOT NULL UNIQUE,         
    password VARCHAR(255) NOT NULL,             
    profile_image VARCHAR(255) DEFAULT NULL,    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
);

CREATE TABLE AI (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    qr_status BOOLEAN NOT NULL,
    malicious_status BOOLEAN DEFAULT 0 
);


CREATE TABLE URL (
    url_id BIGINT AUTO_INCREMENT PRIMARY KEY,    
    user_id BIGINT NOT NULL,                     
    url TEXT NOT NULL,                           
    detection_date DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (user_id) REFERENCES USER(user_id) 
);

CREATE TABLE LOCATION (
    location_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id BIGINT NOT NULL,                       
    latitude DECIMAL(10, 8) NOT NULL,              
    longitude DECIMAL(11, 8) NOT NULL,             
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (user_id) REFERENCES USER(user_id) 
);

CREATE TABLE QR (
    qr_id BIGINT AUTO_INCREMENT PRIMARY KEY,     
    user_id BIGINT NOT NULL,                     
    url TEXT NOT NULL,                           
    location_id BIGINT NOT NULL,                 
    detection_date DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (user_id) REFERENCES USER(user_id), 
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id) 
);

CREATE TABLE DETECTION_RECORD (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id BIGINT NOT NULL,                     
    detection_type ENUM('QR', 'URL') NOT NULL,   
    detection_date DATETIME DEFAULT CURRENT_TIMESTAMP, 
    location_id BIGINT,                          
    malicious BOOLEAN DEFAULT FALSE,             
    url TEXT NOT NULL,                           
    accessed BOOLEAN DEFAULT FALSE,              
    FOREIGN KEY (user_id) REFERENCES USER(user_id), 
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id) 
);