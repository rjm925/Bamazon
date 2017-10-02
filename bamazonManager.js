var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

function menu() {
	inquirer
	.prompt([
		{
			type: "list",
			message: "What would you like to do?",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
			name: "action"
		}
	])
	.then(function(response) {
		if (response.action === "View Products for Sale") {
		  connection.query("SELECT * FROM products", function(err, result) {
		    if (err) throw err;
		    console.log("\n");
		    for (var i = 0; i < result.length; i++) {
		    	console.log("Item ID: " + result[i].item_id + " Product Name: " + result[i].product_name + " Price: $" + result[i].price + " Stock Quantity: " + result[i].stock_quantity);
		    }
		    console.log("\n");
		    menu();
		  });
		}
		else if (response.action === "View Low Inventory") {
			connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, result) {
			    if (err) throw err;
			    console.log("\n");
			    if (result.length === 0) {
			    	console.log("All products have at least 5 in stock");
			    }
			    else {
			    	for (var i = 0; i < result.length; i++) {
				    	console.log("Item ID: " + result[i].item_id + " Product Name: " + result[i].product_name + " Stock Quantity: " + result[i].stock_quantity);
				    }
			    }
			    console.log("\n");
			    menu();
			  });
		}
		else if (response.action === "Add to Inventory") {
			connection.query("SELECT * FROM products", function(err, result) {
		    if (err) throw err;
		    console.log("\n");
		    for (var i = 0; i < result.length; i++) {
		    	console.log("Item ID: " + result[i].item_id + " Product Name: " + result[i].product_name + " Price: $" + result[i].price + " Stock Quantity: " + result[i].stock_quantity);
		    }
		    console.log("\n");

		    inquirer
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
				  connection.query("SELECT item_id, stock_quantity FROM products WHERE item_id = " + response.id, function(err, result) {
  					if (err) throw err;
  					var newQuantity = result[0].stock_quantity + parseInt(response.quantity);
					  var sql = "UPDATE products SET stock_quantity = " + newQuantity + " WHERE item_id = " + response.id;
			        connection.query(sql, function (err, result) {
			          if (err) throw err;
			        });
			      });
				  menu();
				})
		  });
		}
		else if(response.action === "Add New Product") {
			connection.query("SELECT product_name FROM products", function(err, result) {
				if (err) throw err;
				connection.query("SELECT department_name FROM departments", function (err, res) {
					if (err) throw err;
					inquirer
					.prompt([
						{
							type: "input",
							message: "Name of product:",
							name: "product_name",
							validate: function(value) {
								var repeat = false;
								for (var i = 0; i < result.length; i++) {
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
								var exist = false;
								for (var i = 0; i < res.length; i++) {
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
							validate: function(value) {
			          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
			            return true;
			          }
			          return false;
			        }
						}
					])
					.then(function(response) {
					  var sql = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + response.product_name + "', '" + response.department_name + "', " + parseInt(response.price) +", " + parseInt(response.stock_quantity) +");";
					  connection.query(sql, function(err, res) {
					    if (err) throw err;
						});
						menu();
					});
				});
			});
		}
		else {
			connection.end();
		}
	});
}

menu();