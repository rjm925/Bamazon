var mysql = require("mysql");
var inquirer = require("inquirer");
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
  connection.query("SELECT * FROM products", function(err, result, fields) {
    if (err) throw err;

    console.log("\n");
    for (var i = 0; i < result.length; i++) {
      if (result[i].stock_quantity !== 0) {
        console.log("Item ID: " + result[i].item_id + " Product Name: " + result[i].product_name + " Price: $" + result[i].price);
      }
    }
    console.log("\n");

    inquirer
    .prompt([
      {
        type: "input",
        message: "What is the ID number of the item you would like?",
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
    });
  });
}

function checkStock(id) {
  connection.query("SELECT * FROM products WHERE item_id = " + id, function(err, result) {
    if (err) throw err;

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
        bought.push({name: result[0].product_name, quantity: purchase.quantity, cost: result[0].price * purchase.quantity});
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
  console.log("\nThank you for shopping!");
  console.log("\nITEMS PURCHASED:");

  var cost = 0;
  for (var i = 0; i < bought.length; i++) {
    console.log("Product Name: " + bought[i].name + " Quantity: " + bought[i].quantity + " Cost: $" + bought[i].cost);
    cost += bought[i].cost;
  }
  console.log("Total Cost: $" + cost);

  connection.end();
}

getID();