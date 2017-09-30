DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

use bamazon;

CREATE TABLE products (
	item_id INTEGER(10) AUTO_INCREMENT NOT NULL,
	product_name VARCHAR(30) NOT NULL,
	department_name VARCHAR(30) NOT NULL,
	price INTEGER(10) NOT NULL,
	stock_quantity INTEGER(10) NOT NULL,
	product_sales INTEGER(10) default 0 NOT NULL,
	PRIMARY KEY (item_id)
);

CREATE TABLE departments (
	department_id INTEGER(10) AUTO_INCREMENT NOT NULL,
	department_name VARCHAR(30) NOT NULL,
	over_head_costs INTEGER(10) NOT NULL,
	PRIMARY KEY (department_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Headphones", "Electronics", 20, 10);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Fitbit", "Electronics", 150, 5);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Textbook", "Book", 200, 15);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Pillow", "Home", 25, 20);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Basketball", "Sports", 30, 10);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Board Game", "Kids", 15, 15);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Toothpaste", "Health", 5, 50);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Blueray", "Movies", 20, 20);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Earrings", "Jewelry", 100, 5);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Monitor", "Electronics", 400, 3);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Electronics", 5000);
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Book", 1000);
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Home", 500);
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Sports", 250);
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Kids", 100);
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Health", 50);
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Movies", 25);
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Jewelry", 750);
