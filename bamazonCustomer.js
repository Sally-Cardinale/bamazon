var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");

// Initializes the connection variable to sync with a MySQL database
var connection = mysql.createConnection({
  host: 'localhost',
  // Your port;
  port: 3306,
  //Your username
  user: process.env.DB_USER,
  //Your password
  password: process.env.DB_PASSWORD,
  database: 'bamazon'
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  //getProducts();
});

function start() {
  //prints the items for sale and their details
  connection.query('SELECT * FROM Products', function (err, res) {
    if (err) throw err;

    console.log('Welcome to Bamazon!')
    console.log('------------------------------------------------------------------------------------------')

    for (var i = 0; i < res.length; i++) {
      console.log("ID: " + res[i].productID + " | " + "Product Name: " + res[i].productName + " | " + "Department: " + res[i].departmentName + " | " + "Price: " + res[i].price + " | " + "QTY: " + res[i].quantity);
      console.log('------------------------------------------------------------------------------------------')
    }

    console.log(' ');
    inquirer.prompt([{
        type: "input",
        name: "id",
        message: "What is the ID of the product you would like to purchase?",
        validate: function (value) {
          if (isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0) {
            return true;
          } else {
            return false;
          }
        }
      },
      {
        type: "input",
        name: "qty",
        message: "How much would you like to purchase?",
        validate: function (value) {
          if (isNaN(value)) {
            return false;
          } else {
            return true;
          }
        }
      }
    ]).then(function (ans) {
      var whatToBuy = (ans.id) - 1;
      var howMuchToBuy = parseInt(ans.qty);
      //var total = parseFloat(((res[whatToBuy].Price)*howMuchToBuy).toFixed(2));

      //check if quantity is sufficient
      if (res[whatToBuy].quantity >= howMuchToBuy) {
        //after purchase, updates quantity in Products
        connection.query("UPDATE Products SET ? WHERE ?", [{
            quantity: (res[whatToBuy].quantity - howMuchToBuy)
          },
          {
            productID: ans.id
          }
        ], function (err, result) {
          if (err) throw err;
          console.log("Success! Your item(s) will be shipped to you in 3-5 business days.");
          connection.end();
        });

        connection.query("SELECT * FROM products", function (err, deptRes) {
          if (err) throw err;
          var index;
          for (var i = 0; i < deptRes.length; i++) {
            if (deptRes[i].departmentName === res[whatToBuy].Department) {
              index = i;
            }
          }

        });

      } else {
        console.log("Sorry, that item is out of stock! Please try again later.");
        connection.end();
      }

    })
  })
}

start()