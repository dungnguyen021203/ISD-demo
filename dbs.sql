-- create database customer_management;
-- drop database customer_management;
-- use customer_management;
SET GLOBAL event_scheduler = ON;
-- Creating the tables

-- Sales person who manage the customer's information, customer's order history
CREATE TABLE IF NOT EXISTS Salespersons (
    sales_id INT AUTO_INCREMENT PRIMARY KEY,
    sales_name VARCHAR(255),
    username VARCHAR(255) UNIQUE,  
    password VARCHAR(255),        
    role ENUM('sales', 'admin')    
);

-- Accounts for customer (just present)
CREATE TABLE IF NOT EXISTS WebsiteAccounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    active_status BOOLEAN
);

-- Customer's information
CREATE TABLE IF NOT EXISTS Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    sales_id INT,
    customer_type VARCHAR(255),
    customer_code VARCHAR(100),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phoneNumber VARCHAR(20),
    customer_citizenID VARCHAR(20),
    add_date DATE,
    website_account_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (sales_id) REFERENCES Salespersons(sales_id),
    FOREIGN KEY (website_account_id) REFERENCES WebsiteAccounts(account_id)
);

-- Shoes and Shoe Images database
CREATE TABLE IF NOT EXISTS Shoes (
    shoes_id INT AUTO_INCREMENT PRIMARY KEY,
    shoes_brand VARCHAR(255),
    shoes_name VARCHAR(255) NOT NULL,
    shoes_type VARCHAR(255),
    shoes_size VARCHAR(10),
    shoes_color VARCHAR(50),
    shoes_material VARCHAR(255),
    shoes_price DECIMAL(10, 2),
    shoes_status VARCHAR(255),
    discounted_price DECIMAL(10, 2) DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS ShoeImages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    shoes_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (shoes_id) REFERENCES Shoes(shoes_id)
);

-- Order's history
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(255),
    customer_id INT,
    shoes_id INT,
    order_amount INT,
    order_cost DECIMAL(10, 2),
    order_buyDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(255),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    shipment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    shipment_process TEXT,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY (shoes_id) REFERENCES Shoes(shoes_id)
);

-- Event for automatic cleanup of deleted records
DELIMITER $$
CREATE EVENT IF NOT EXISTS ev_AutoDeleteTrash
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  BEGIN
    DELETE FROM Customers
    WHERE is_deleted = TRUE AND deleted_at < NOW() - INTERVAL 30 DAY;
  END$$
DELIMITER ;



-- Test
-- select * from customers;
-- select * from orders;
-- select * from shoes;
-- select * from ShoeImages;
-- select * from salespersons;
-- select * from websiteaccounts;


INSERT INTO Salespersons (sales_id, sales_name, username, password, role) VALUES (1, 'John Doe', 'johndoe1', '123456', 'admin');
INSERT INTO Salespersons (sales_id, sales_name, username, password, role) VALUES (2, 'Jane Smith', 'janesmith', '123456', 'sales');
INSERT INTO WebsiteAccounts (username, password, active_status) VALUES ('user1', 'password1', TRUE);
INSERT INTO WebsiteAccounts (username, password, active_status) VALUES ('user2', 'password2', FALSE);
INSERT INTO WebsiteAccounts (username, password, active_status) VALUES ('user3', 'password3', FALSE);
INSERT INTO Customers (sales_id, customer_type, customer_code, customer_name, customer_email, customer_phoneNumber, customer_citizenID, add_date, website_account_id) VALUES (1, 'Individual', 'CUST001', 'Alice Brown', 'alice@example.com', '555-0101', '123456789', '2023-04-01', 1);
INSERT INTO Customers (sales_id, customer_type, customer_code, customer_name, customer_email, customer_phoneNumber, customer_citizenID, add_date, website_account_id) VALUES (1, 'Enterprise', 'CUST002', 'Bob Green', 'bob@example.com', '555-0202', '987654321', '2023-04-02', 2);
INSERT INTO Customers (sales_id, customer_type, customer_code, customer_name, customer_email, customer_phoneNumber, customer_citizenID, add_date, website_account_id) VALUES (1, 'Enterprise', 'CUST003', 'Dung Curry', 'dung@example.com', '555-0303', '0348242935', '2023-04-02', 3);
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Nike', 'Air Max', 'Running', '9', 'Black', 'Synthetic', 199.99, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Adidas', 'Ultra Boost', 'Running', '10', 'White', 'Mesh', 180.50, 'Available');
INSERT INTO ShoeImages (shoes_id, image_url) VALUES (1, 'http://example.com/image1.jpg');
INSERT INTO ShoeImages (shoes_id, image_url) VALUES (2, 'http://example.com/image2.jpg');
INSERT INTO Orders (order_code, customer_id, shoes_id, order_amount, order_cost, order_buyDate, payment_status, payment_date, shipment_date, shipment_process) VALUES ('ORD001', 1, 1, 2, 399.98, default, 'Paid', default, default, 'Shipped');
INSERT INTO Orders (order_code, customer_id, shoes_id, order_amount, order_cost, order_buyDate, payment_status, payment_date, shipment_date, shipment_process) VALUES ('ORD002', 2, 2, 1, 180.50, default, 'Pending', default, default, 'Preparing for shipment');


INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Nike', 'Air Max', 'Running', '9', 'Black', 'Synthetic', 199.99, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Adidas', 'Ultra Boost', 'Running', '10', 'White', 'Mesh', 180.50, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Reebok', 'Classic', 'Casual', '8', 'Navy', 'Leather', 75.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Puma', 'Speed Cat', 'Casual', '11', 'Red', 'Suede', 85.99, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('New Balance', '574', 'Casual', '9.5', 'Grey', 'Synthetic', 70.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Asics', 'Gel-Nimbus', 'Running', '9', 'Blue', 'Mesh', 130.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Saucony', 'Jazz Original', 'Running', '10', 'Green', 'Nylon', 60.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Brooks', 'Ghost', 'Running', '11', 'Black', 'Mesh', 120.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Hoka One One', 'Clifton', 'Running', '10.5', 'Orange', 'Mesh', 140.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Under Armour', 'Charged Assert', 'Running', '9', 'White', 'Synthetic', 90.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Nike', 'ZoomX', 'Running', '9', 'Pink', 'Synthetic', 250.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Adidas', 'Stan Smith', 'Casual', '8', 'White', 'Leather', 80.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Vans', 'Old Skool', 'Skateboarding', '10', 'Black', 'Canvas', 60.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Converse', 'Chuck Taylor', 'Casual', '11', 'Red', 'Canvas', 55.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Puma', 'Ignite', 'Running', '9.5', 'Blue', 'Mesh', 100.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Timberland', 'Classic Boots', 'Outdoor', '11', 'Brown', 'Leather', 175.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Merrell', 'Moab 2', 'Hiking', '10', 'Earth', 'Suede', 120.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Skechers', 'Go Walk', 'Walking', '8', 'Black', 'Mesh', 50.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Altra', 'Torin', 'Running', '9', 'Grey', 'Mesh', 130.00, 'Available');
INSERT INTO Shoes (shoes_brand, shoes_name, shoes_type, shoes_size, shoes_color, shoes_material, shoes_price, shoes_status) VALUES ('Salomon', 'Speedcross', 'Trail Running', '10', 'Black', 'Mesh', 130.00, 'Available');


    
	