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

connection.query("SELECT item_id, product_name, price FROM products", function(err, result, fields) {
  if (err) throw err;
  console.log(JSON.stringify(result, null, 2));
  console.log("\n");

  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the ID number of the item you would like? ",
        name: "id",
        validate: function(value) {
          if (isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <= result.length) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(response) {
      console.log("\nItem Selected: " + result[response.id-1].product_name + "\n");

      checkStock(response.id);
    })
});

function checkStock(id) {
  connection.query("SELECT item_id, price, stock_quantity, product_sales FROM products WHERE item_id = " + id, function(err, result) {
    if (err) throw err;

    inquirer
    .prompt([
      {
        type: "input",
        message: "How many units would you like to purchase? ",
        name: "quantity"
      }
    ])
    .then(function(purchase) {
      if (purchase.quantity > result[0].stock_quantity) {
        console.log("\nInsufficient quantity!");
        console.log("\nQuantity remaining: " + result[0].stock_quantity + "\n");
        checkStock(id);
      }
      else {
        console.log("\nTotal cost: $" + result[0].price * purchase.quantity);
        var newQuantity = result[0].stock_quantity - purchase.quantity;
        var newSales = result[0].product_sales + result[0].price * purchase.quantity;
        var sql = "UPDATE products SET stock_quantity = " + newQuantity + ", product_sales = " + newSales + " WHERE item_id = " + id;
        connection.query(sql, function (err, result) {
          if (err) throw err;
        });
        connection.end();
      }
    })
  });
}