var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
var bought = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

function getID() {
  connection.query("SELECT item_id, product_name, price FROM products WHERE stock_quantity > 0", function(err, result, fields) {
    if (err) throw err;

    console.log("\n");
    console.table(result);

    if (result.length === 0) {
      console.log("Out of everything!");
      return connection.end();
    }

    inquirer
    .prompt([
      {
        type: "input",
        message: "What is the ID number of the item you would like?",
        name: "id",
        validate: function(value) {
          var validID = false;
          for(var i = 0; i < result.length; i++) {
            if (parseInt(value) === result[i].item_id) {
              validID = true;
            }
          }
          if (validID) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(response) {
      checkStock(response.id);
    });
  });
}

function checkStock(id) {
  connection.query("SELECT * FROM products WHERE item_id = " + id, function(err, result) {
    if (err) throw err;

    console.log("\nItem Selected: " + result[0].product_name + "\n");

    inquirer
    .prompt([
      {
        type: "input",
        message: "How many would you like to purchase?",
        name: "quantity",
        validate: function(value) {
          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(purchase) {
      if (purchase.quantity > result[0].stock_quantity) {
        console.log("\nInsufficient quantity!");
        console.log("\nQuantity remaining: " + result[0].stock_quantity + "\n");
        checkStock(id);
      }
      else {
        console.log("\nTotal cost: $" + result[0].price * purchase.quantity + "\n");
        var newQuantity = result[0].stock_quantity - purchase.quantity;
        var newSales = result[0].product_sales + result[0].price * purchase.quantity;
        var sql = "UPDATE products SET stock_quantity = " + newQuantity + ", product_sales = " + newSales + " WHERE item_id = " + id;
        connection.query(sql, function (err, result) {
          if (err) throw err;
        });
        bought.push({product: result[0].product_name, quantity: purchase.quantity, cost: result[0].price * purchase.quantity});
        keepShopping();
      }
    })
  });
}

function keepShopping() {
  inquirer
    .prompt([
      {
        type: "confirm",
        message: "Do you want to keep shopping?",
        name: "again"
      }
    ])
    .then(function(response) {
      if (response.again) {
        getID();
      }
      else {
        done();
      }
    })
}

function done() {
  console.log("\nThank you for shopping!\n");

  console.table(bought);

  var cost = 0;
  for (var i = 0; i < bought.length; i++) {
    cost += bought[i].cost;
  }
  console.log("Total Cost: $" + cost);

  connection.end();
}

getID();