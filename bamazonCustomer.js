const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");
let bought = [];

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

// Get the ID of the item
function getID() {
  // Get all items from database with stock greater than 0
  connection.query("SELECT item_id, product_name, price FROM products WHERE stock_quantity > 0", function(err, result, fields) {
    if (err) throw err;

    // Display table of results
    console.log("\n");
    console.table(result);

    // No items left in stock
    if (result.length === 0) {
      console.log("Out of everything!");
      return connection.end();
    }

    // Ask user for item ID that they want to buy
    inquirer
    .prompt([
      {
        type: "input",
        message: "What is the ID number of the item you would like?",
        name: "id",
        // Checks if input is an ID of a number
        validate: function(value) {
          let validID = false;
          for(let i = 0; i < result.length; i++) {
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
      // Call checkStock function
      checkStock(response.id);
    });
  });
}

// Checks if enough is in stock
function checkStock(id) {
  // Gets information about item based on id
  connection.query("SELECT * FROM products WHERE item_id = " + id, function(err, result) {
    if (err) throw err;

    // Shows user what they selected
    console.log("\nItem Selected: " + result[0].product_name + "\n");

    // Asks user how many they would like to buy
    inquirer
    .prompt([
      {
        type: "input",
        message: "How many would you like to purchase?",
        name: "quantity",
        // Checks if input is a number
        validate: function(value) {
          if (isNaN(value) === false && Number.isInteger(parseInt(value))) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(purchase) {
      // Not enough in stock and displays remaining stock
      if (purchase.quantity > result[0].stock_quantity) {
        console.log("\nInsufficient quantity!");
        console.log("\nQuantity remaining: " + result[0].stock_quantity + "\n");
        checkStock(id);
      }
      // Complete transaction
      else {
        console.log("\nTotal cost: $" + result[0].price * purchase.quantity + "\n");
        // Calculates remaining quantity of store
        let newQuantity = result[0].stock_quantity - purchase.quantity;
        // Calculates total sales of product
        let newSales = result[0].product_sales + result[0].price * purchase.quantity;
        // Updates products table
        let sql = "UPDATE products SET stock_quantity = " + newQuantity + ", product_sales = " + newSales + " WHERE item_id = " + id;
        connection.query(sql, function (err, result) {
          if (err) throw err;
        });
        // Adds transaction to array
        bought.push({product: result[0].product_name, quantity: purchase.quantity, cost: result[0].price * purchase.quantity});
        // Call keepShopping function
        keepShopping();
      }
    })
  });
}

// Ask user if they would like to continue
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
        // Display product table again
        getID();
      }
      else {
        // Done shopping
        done();
      }
    })
}

// Displays to user what they bought and how much everything costs
function done() {
  console.log("\nThank you for shopping!\n");

  console.table(bought);

  let cost = 0;
  for (let i = 0; i < bought.length; i++) {
    cost += bought[i].cost;
  }
  console.log("Total Cost: $" + cost);

  connection.end();
}

// Start program
getID();