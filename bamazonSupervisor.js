var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

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
			var sql = "SELECT departments.*, SUM(IFNULL(products.product_sales, 0)) AS product_sales, (SUM(IFNULL(products.product_sales, 0)) - departments.over_head_costs) AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_name ORDER BY department_id;"
			connection.query(sql, function(err, result) {
				console.log("\n");
				console.table(result);
				menu();
			})
		}
		else if (response.action === "Create New Department") {
			connection.query("SELECT department_name FROM departments", function(err, result) {
				inquirer
					.prompt([
						{
							type: "input",
							message: "Enter new department name:",
							name: "department_name",
							validate: function(value) {
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
			          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
			            return true;
			          }
			          return false;
			        }
						}
					])
					.then(function(response) {
						var sql = "INSERT INTO departments (department_name, over_head_costs) VALUES ('" + response.department_name + "', " + response.over_head_costs + ");";
						connection.query(sql);
						menu();
						})
			})
		}
		else {
			connection.end();
		}
	})
}

menu();