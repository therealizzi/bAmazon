

//Set up MySQL connection

var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var Table = require("easy-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",

	password: process.env.MYSQL_ROOT_PW,

	database: "bamazon_db"
})

connection.connect(function(err) {
	if (err) throw err;
	initiate()
}) 

// ---------- CLI ----------

function initiate() {
	inquirer
		.prompt ({
			name: "initiate",
			type: "rawlist",
			message: "What would you like to do?",
			choices: [
				"Shop (customer)",
				"Manage (manager)",
				"Overview (supervisor)",
				"Exit"
			]
		})
		.then(function(answer) {
			switch (answer.initiate) {
				case "Shop (customer)":
					shop();
					break;

				case "Manage (manager)":
					manage();
					break;

				case "Overview (supervisor)":
					overview();
					break;

				case "Exit":
					console.log("\nGood day")
					process.exit();
					break;
			}
		})
}

// ---------- Customer Section ----------

function shop() {

		var items = [];

	connection.query("SELECT * FROM products", function(err,res) {
		if (err) throw err;

		var t = new Table 

		console.log("\n")
		res.forEach(function(product) {
			t.cell('Product Id', product.id)
			t.cell('Description', product.product)
			t.cell('Price (USD)', product.price)
			t.cell('Quantity', product.quantity)
			t.newRow()
		})
		console.log(t.toString());
		});

	inquirer
		.prompt ({
			name: "purchase",
			message: chalk.underline.green("\nCustomer - type a product Id # to make a purchase:"),
			validate: function(value) {
				if (isNaN(value) === false){
					return true;
				}
				return false;
			}
		})
		.then(function(answer) {
			buy(answer.purchase)
	});
}

function buy(item){
	inquirer
		.prompt ({
			name: "quantity",
			type: "input",
			message: "How many do you want to buy?"
		})
		.then(function(answer) {
			connection.query("SELECT quantity FROM products WHERE id ="+item+";", function(err, result) {
				console.log(result[0].quantity);
				switch (true) {
				case (answer.quantity < 1):
					console.log("Please input a number");
					buy(item);
					break;
				case (answer.quantity > result[0].quantity):
					console.log("I'm sorry, we don't have enough!")
					buy(item);
					break;
				case (answer.quantity <= result[0].quantity):
					console.log(chalk.blue.bold("\nYou purchased: "+answer.quantity+" of product #"+item));
					reduceItems(item, answer.quantity);
					inquirer
						.prompt({
							name: "next",
							type: "confirm",
							message: "Keep shopping?"
						})
						.then(function(answer) {
							if (answer.next) {
								shop()
							} else (initiate())
						});
				}
			});
		})
}

function reduceItems(item, quantity) {
	connection.query("UPDATE products SET quantity = quantity -"+quantity+" WHERE id = "+item, function(err,res) {
	if (err) throw err;
	})
}	

// ---------- Manager Section ----------

function manage() {
	inquirer
		.prompt ({
			name: "manage",
			type: "rawlist",
			message: "\nManager - here are your options:",
			choices: [
			"See product inventory",
			"See low inventory items",
			"Add to inventory",
			"Add new product",
			"Return to main"
			]
		}).then(function(answer) {
			switch (answer.manage) {
				case "See product inventory":
					allInventory();
					break;

				case "See low inventory items":
					lowInventory();
					break; 

				case "Add to inventory":
					addInventory();
					break;

				case "Add new product":
					addProduct();
					break;

				case "Return to main":
					initiate();
					break;
			}
		});
}

function allInventory() {
	connection.query("SELECT * FROM bamazon_db.products", function(err, res)  {
		if (err) throw err;

		var t = new Table;

		res.forEach(function(product) {
			t.cell('Product Id', product.id)
			t.cell('Description', product.product)
			t.cell('Price', product.price)
			t.cell('Quantity', product.quantity)
			t.newRow()
		})

		console.log("\n")
		console.log(t.toString())
		manage();
		}
	)
}


function lowInventory() {
	connection.query("SELECT * FROM bamazon_db.products WHERE Quantity < 5", function(err, res)  {
		if (err) throw err;

		var t = new Table;

		res.forEach(function(product) {
			t.cell('Product Id', product.id)
			t.cell('Description', product.product)
			t.cell('Price', product.price)
			t.cell('Quantity', product.quantity)
			t.newRow()
		})

		console.log("\n")
		console.log(t.toString())
		manage();
		}
	)
}

function addInventory() {

	inquirer
		.prompt ({
			name: "restock_product",
			type: "input",
			message: "Type the Id of the product you want to re-stock:"
		})
		.then(function(answer) {

			connection.query("UPDATE products SET quantity = quantity + 5 WHERE id ="+answer.restock_product, function(err, res)  {
			if (err) throw err;

			allInventory();
			})
		}
	)
}

function addProduct() {
	console.log("\nTo add a new product, please complete this form:")
	
	inquirer
		.prompt ([
		{
			type: "input",
			name: "product",
			message: "What is the name of the product you're adding?"
		},
		{
			type: "input",
			name: "quantity",
			message: "How many are you adding?"
		},
		{
			type: "input",
			name: "price",
			message: "What is the price?"
		}])

		.then(function(answer) {

		var query = connection.query(
			"INSERT INTO products SET ?",
			[
				{
					product: answer.product,
					quantity: answer.quantity,
					price: answer.price
				}
			],
			function(err, res) {
				console.log(res.affectedRows + " products added \n");
				allInventory();
			}
		);

	})
}

// ---------- Supervisor Section ----------

function overview() {
	inquirer
		.prompt({
			name: "overview",
			type: "rawlist",
			message: "What would you like to do?",
			choices: [
				"View Product Sales By Department",
				"Create New Department",
				"Close Department",
				"Return to main"
			]
		})
		.then(function(answer) {
			switch (answer.overview) {
				case "View Product Sales By Department":
					departmentSales();
					break;

				case "Create New Department":
					createDepartment();
					break;

				case "Close Department":
					closeDepartment();
					break;

				case "Return to main":
					initiate();
					break;
			}
		})
}

function departmentSales() {
	console.log("Sales reports are under development");
	overview();
}

function createDepartment() {
	console.log("New Department function under development");
	overview();
}

function closeDepartment() {
	console.log("Close Department function under development");
	overview();
}
