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
	.prompt ([
		{
			type: "list",
			message: "What do you want to do?",
			choices: ["View Product Sales by Department", "Create New Department"],
			name: "action"
		}
	])
	.then(function(response) {
		if (response.action === "View Product Sales by Department") {
			var sql = "SELECT departments.*, SUM(products.product_sales) AS product_sales, (product_sales - departments.over_head_costs) AS total_profit FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY products.department_name ORDER BY department_id;"
			connection.query(sql, function(err, result) {
				console.log(result);
			})
			connection.end();
		}
		else {
			inquirer
				.prompt([
					{
						type: "input",
						message: "Enter new department name: ",
						name: "department_name"	
					},
					{
						type: "input",
						message: "Enter over head cost: ",
						name: "over_head_costs"
					}
				])
				.then(function(response) {
					connection.query("SELECT department_name FROM departments", function(err, result) {
						var newDepartment = true;
						for (var i = 0; i < result.length; i++) {
							if (response.department_name.toUpperCase() === result[i].department_name.toUpperCase()) {
								newDepartment = false;
							}
						}

						if (newDepartment) {
							var sql = "INSERT INTO departments (department_name, over_head_costs) VALUES ('" + response.department_name + "', " + response.over_head_costs + ");";
							connection.query(sql)
						}
						else {
							console.log("Already a department");
						}
						connection.end();
					})
				})		
		}
	})