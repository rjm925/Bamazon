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

inquirer
	.prompt([
		{
			type: "list",
			message: "What would you like to do?",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
			name: "action"
		}
	])
	.then(function(response) {
		if (response.action === "View Products for Sale") {
		  connection.query("SELECT item_ID, product_name, price, stock_quantity FROM products", function(err, result) {
		    if (err) throw err;
		    console.log(JSON.stringify(result, null, 2));
		    connection.end();
		  });
		}
		else if (response.action === "View Low Inventory") {
			connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
			    if (err) throw err;
			    console.log(res);
			    connection.end();
			  });
		}
		else if (response.action === "Add to Inventory") {
			inquirer
				.prompt([
					{
						type: "input",
						message: "What is the ID of the item you would like to add to?",
						name: "id"
					},
					{
						type: "input",
						message: "How many would you like to add?",
						name: "quantity"
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
			        connection.end();
			      });
				})
		}
		else	{
			inquirer
				.prompt([
					{
						type: "input",
						message: "Name of product: ",
						name: "product_name"
					},
					{
						type: "input",
						message: "Department of product: ",
						name: "department_name"
					},
					{
						type: "input",
						message: "Price of product: ",
						name: "price"
					},
					{
						type: "input",
						message: "Stock quantity of product: ",
						name: "stock_quantity"
					}
				])
				.then(function(response) {
				  var sql = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + response.product_name + "', '" + response.department_name + "', " + parseInt(response.price) +", " + parseInt(response.stock_quantity) +");";
				  connection.query(sql, function(err, res) {
				    if (err) throw err;
					});
					connection.end();
				})
		}
	});