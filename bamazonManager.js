const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

// Connect to MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

// Asks user what they would like to do
function menu() {
	inquirer
	// List of actions the manager can select from
	.prompt([
		{
			type: "list",
			message: "What would you like to do?",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
			name: "action"
		}
	])
	.then(function(response) {
		// Shows a table of products
		if (response.action === "View Products for Sale") {
			// Searches product database
		  connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(err, result) {
		    if (err) throw err;
		    // Show results
		    console.log("\n");
		    console.table(result);
		    // Goes back to menu
		    menu();
		  });
		}
		// Shows products less than 5 in stock
		else if (response.action === "View Low Inventory") {
			// Searches products table for any items below 5 in stock
			connection.query("SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5", function(err, result) {
			    if (err) throw err;
			    console.log("\n");
			    // No items below 5
			    if (result.length === 0) {
			    	console.log("All products have at least 5 in stock");
			    }
			    // Display items below 5
			    else {
			    	console.table(result);
			    }
			    // Goes back to menu
			    menu();
			  });
		}
		// Shows table of products and asks what product they would like to add stock to
		else if (response.action === "Add to Inventory") {
			// Searches for all products in database
			connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(err, result) {
		    if (err) throw err;
		    // Displays results
		    console.log("\n");
		    console.table(result);
		    
		    inquirer
		    // Ask manager for ID of item and how much they would like to add
				.prompt([
					{
						type: "input",
						message: "What is the ID of the item you would like to add to?",
						name: "id",
						validate: function(value) {
		          if (isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <= result.length) {
		            return true;
		          }
		          return false;
		        }
					},
					{
						type: "input",
						message: "How many would you like to add?",
						name: "quantity",
						validate: function(value) {
		          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
		            return true;
		          }
		          return false;
		        }
					}
				])
				.then(function(response) {
					// Updates table by adding the input stock to stock already in store
				  connection.query("SELECT item_id, stock_quantity FROM products WHERE item_id = " + response.id, function(err, result) {
  					if (err) throw err;
  					// Gets quantity of item form database and adds manager input
  					let newQuantity = result[0].stock_quantity + parseInt(response.quantity);
					  let sql = "UPDATE products SET stock_quantity = " + newQuantity + " WHERE item_id = " + response.id;
			        connection.query(sql, function (err, result) {
			          if (err) throw err;
			        });
			      });
				  // Goes back to menu
				  menu();
				})
		  });
		}
		// Manager can add a new product to sore
		else if(response.action === "Add New Product") {
			// Gets product names from prodcuts table
			connection.query("SELECT product_name FROM products", function(err, result) {
				if (err) throw err;
				// Gets department names from department table
				connection.query("SELECT department_name FROM departments", function (err, res) {
					if (err) throw err;
					inquirer
					// Asks manager name of new product, department it belongs to, price, and stock
					.prompt([
						{
							type: "input",
							message: "Name of product:",
							name: "product_name",
							validate: function(value) {
								let repeat = false;
								// Checks if new item
								for (let i = 0; i < result.length; i++) {
									if (result[i].product_name.toUpperCase() === value.toUpperCase()) {
										repeat = true;
									}
								}
								if (value !== "" && repeat === false) {
			            return true;
			          }
			          return false;
							}
						},
						{
							type: "input",
							message: "Department of product:",
							name: "department_name",
							validate: function(value) {
								let exist = false;
								// Checks if department exists
								for (let i = 0; i < res.length; i++) {
									if (res[i].department_name.toUpperCase() === value.toUpperCase()) {
										exist = true;
									}
								}
								if (value !== "" && exist) {
			            return true;
			          }
			          return false;
							}
						},
						{
							type: "input",
							message: "Price of product:",
							name: "price",
							// Checks if input is a number
							validate: function(value) {
			          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
			            return true;
			          }
			          return false;
			        }
						},
						{
							type: "input",
							message: "Stock quantity of product:",
							name: "stock_quantity",
							// Checks if input is a number
							validate: function(value) {
			          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
			            return true;
			          }
			          return false;
			        }
						}
					])
					.then(function(response) {
					  let sql = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + response.product_name + "', '" + response.department_name + "', " + parseInt(response.price) +", " + parseInt(response.stock_quantity) +");";
					  // Adds item to products table
					  connection.query(sql, function(err, res) {
					    if (err) throw err;
						});
						// Goes back to menu
						menu();
					});
				});
			});
		}
		// Manager exited
		else {
			connection.end();
		}
	});
}

// Start program
menu();