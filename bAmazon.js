

//Set up MySQL connection

var mysql = require("mysql");
var inquirer = require("inquirer");
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
			message: "Which product Id would you like?",
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
				if (isNaN(answer.quantity)) {
					console.log("Please input a number");
					buy(item);
				} else if (answer.quantity < 1) {
					console.log("Please input a number");
					buy(item);
				} else 

					console.log("\nYou purchased: "+answer.quantity+" of product #"+item)
					console.log("\nYour purchase is ready!\n");
					reduceItems(item, answer.quantity);
					
					inquirer
						.prompt({
							name: "next",
							type: "string",
							message: "Keep shopping, y/n?"
						})
						.then(function(answer) {
							if (answer.next == "y") {
								shop()
							} else (initiate())
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
			message: "What would you like to do?",
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
			name: "add_product",
			type: "input",
			message: "Type the name of the product you want to re-stock:"
		})
		.then(function(answer) {

	connection.query("UPDATE bamazon_db.products SET quantity = quantity + 1 WHERE product ="+"'"+answer.add_product+"'", function(err, res)  {
		if (err) throw err;

		allInventory();
		})



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

function addProduct() {
	//
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
				"Close Department"
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
			}
		})
}

function departmentSales() {
	//
}

function createDepartment() {
	//
}

function closeDepartment() {

}
