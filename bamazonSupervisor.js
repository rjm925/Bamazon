var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// Connect to MySQL database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

// List of actions for supervisor
function menu() {
	inquirer
	.prompt ([
		{
			type: "list",
			message: "What do you want to do?",
			choices: ["View Product Sales by Department", "Create New Department", "Exit"],
			name: "action"
		}
	])
	.then(function(response) {
		if (response.action === "View Product Sales by Department") {
			// Create query to join products and departments table
			var sql = "SELECT departments.*, SUM(IFNULL(products.product_sales, 0)) AS product_sales, (SUM(IFNULL(products.product_sales, 0)) - departments.over_head_costs) AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_name ORDER BY department_id;"
			connection.query(sql, function(err, result) {
				// Display results
				console.log("\n");
				console.table(result);
				// Goes back to menu
				menu();
			})
		}
		else if (response.action === "Create New Department") {
			// Get department names from table
			connection.query("SELECT department_name FROM departments", function(err, result) {
				inquirer
					.prompt([
						{
							type: "input",
							message: "Enter new department name:",
							name: "department_name",
							validate: function(value) {
								// Checks if input does not already exist
								var newDepartment = true;
								for (var i = 0; i < result.length; i++) {
									if (value.toUpperCase() === result[i].department_name.toUpperCase()) {
										newDepartment = false;
									}
								}
								if (value !== "" && newDepartment) {
			            return true;
			          }
			          return false;
							}
						},
						{
							type: "input",
							message: "Enter over head cost:",
							name: "over_head_costs",
							validate: function(value) {
								// Checks if input is a number
			          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
			            return true;
			          }
			          return false;
			        }
						}
					])
					.then(function(response) {
						// Add new department to table
						var sql = "INSERT INTO departments (department_name, over_head_costs) VALUES ('" + response.department_name + "', " + response.over_head_costs + ");";
						connection.query(sql);
						// Goes back to menu
						menu();
						})
			})
		}
		else {
			// Supervisor exited
			connection.end();
		}
	})
}

// Start of program
menu();