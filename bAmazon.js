
//--------------------- bAmazon: A node shopping experience ---------------------

//Set up MySQL connection
var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var Table = require("easy-table");

//Create the mysql connect variable
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: process.env.MYSQL_ROOT_PW,
	database: "bamazon_db"
})

//Once conneciton is complete, this starts the program
connection.connect(function(err) {
	if (err) throw err;
	initiate()
}) 

// ---------- CLI ----------

//This is the home CLI for the program
function initiate() {

	//Home prompt for user routing
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
		//Routes users based on their purpose
		.then(function(answer) {
			switch (answer.initiate) {

				//Initiates "shop" block for customers
				case "Shop (customer)":
					shop();
					break;

				//Initiaties "manage" block for managers
				case "Manage (manager)":
					manage();
					break;

				//Initiates "overview" block for supervisors
				case "Overview (supervisor)":
					overview();
					break;

				//Ends the program
				case "Exit":
					console.log("\nGood day")
					process.exit();
					break;
			}
		})
}

// ---------- Customer Section ----------

//This is the customer "shop" block
function shop() {

	//Grabs the store inventory from Mysql
	connection.query("SELECT * FROM products", function(err,res) {
		if (err) throw err;

		var t = new Table 

		//Assigns the story inventory in an easy-table
		console.log("\n")
		res.forEach(function(product) {
			t.cell('Product Id', product.id)
			t.cell('Department', product.department)
			t.cell('Description', product.product)
			t.cell('Price (USD)', product.price)
			t.cell('Quantity', product.quantity)
			t.newRow()
		})

		//Displays inventory easy-able
		console.log(t.toString());
		});

	//Asks customer to pick an item for purchase
	inquirer
		.prompt ({
			name: "purchase",
			message: chalk.underline.green("\nCustomer - type a product Id # to make a purchase:"),
			
			//Validates the customer input
			validate: function(value) {
				if (isNaN(value) === false){
					return true;
				}
				return false;
			}
		})
		//Initiates a buy function for the item
		.then(function(answer) {
			buy(answer.purchase)
	});
}

//This function validates purchase quantity and initiates inventory deduction
function buy(item){
	inquirer

		//Asks customer what quantity to deduct
		.prompt ({
			name: "quantity",
			type: "input",
			message: "How many do you want to buy?"
		})

		//Validates customer request and debits inventory
		.then(function(answer) {
			connection.query("SELECT quantity FROM products WHERE id ="+item+";", function(err, result) {
				console.log(result[0].quantity);
				switch (true) {

				//Checks to make sure value is greater than 0
				case (answer.quantity < 1):
					console.log("Please input a number");
					buy(item);
					break;

				//Checks to make sure enough inventory is in stock
				case (answer.quantity > result[0].quantity):
					console.log("I'm sorry, we don't have enough!")
					buy(item);
					break;

				//Confirms purchase if prior cases are passed
				case (answer.quantity <= result[0].quantity):

					//Tells customer what happened
					console.log(chalk.blue.bold("\nYou purchased: "+answer.quantity+" of product #"+item));
					
					//Initiates mysql inventory deduction
					reduceItems(item, answer.quantity);
					inquirer

						//Asks customer what to do next
						.prompt({
							name: "next",
							type: "confirm",
							message: "Keep shopping?"
						})

						//Routes customer based on answer above
						.then(function(answer) {
							if (answer.next) {
								shop()
							} else (initiate())
						});
				}
			});
		})
}

//This function reduces inventory in Mysql database
function reduceItems(item, quantity) {
	connection.query("UPDATE products SET quantity = quantity -"+quantity+" WHERE id = "+item, function(err,res) {
	if (err) throw err;
	})
}	

// ---------- Manager Section ----------

//This is the "manage" store block
function manage() {
	inquirer

		//Routes user based on management functions
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

			//Compares options and routes to appropriate function
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

//This function displays all inventory in the database
function allInventory() {

	//Connection to Mysql to request data
	connection.query("SELECT * FROM bamazon_db.products", function(err, res)  {
		if (err) throw err;

		var t = new Table;

		//Organize inventory using easy-table
		res.forEach(function(product) {
			t.cell('Product Id', product.id)
			t.cell('Description', product.product)
			t.cell('Price', product.price)
			t.cell('Quantity', product.quantity)
			t.newRow()
		})

		//Display inventory in easy-table
		console.log("\n")
		console.log(t.toString())

		//Returns to top of manager block
		manage();
		}
	)
}

//This function scans database for inventory items with <5 units
function lowInventory() {

	//Query database
	connection.query("SELECT * FROM bamazon_db.products WHERE Quantity < 5", function(err, res)  {
		if (err) throw err;

		var t = new Table;

		//Organize inventory using easy-table
		res.forEach(function(product) {
			t.cell('Product Id', product.id)
			t.cell('Description', product.product)
			t.cell('Price', product.price)
			t.cell('Quantity', product.quantity)
			t.newRow()
		})

		//Display inventory in easy-table
		console.log("\n")
		console.log(t.toString())
		manage();
		}
	)
}

//This function allows managers to credit inventory in the database
function addInventory() {

	//Lets manager identify which item to credit
	inquirer
		.prompt ({
			name: "restock_product",
			type: "input",
			message: "Type the Id of the product you want to re-stock:"
		})
		//Initiates database credit process
		.then(function(answer) {

			//Queries database and increases quantity by +5
			connection.query("UPDATE products SET quantity = quantity + 5 WHERE id ="+answer.restock_product, function(err, res)  {
			if (err) throw err;

			//Returns the updated inventory table
			allInventory();
			})
		}
	)
}

//This function allows managers to create new product items in inventory
function addProduct() {
	console.log("\nTo add a new product, please complete this form:")
	
	//Form for new product
	inquirer
		.prompt ([
		{ //Product name
			type: "input",
			name: "product",
			message: "What is the name of the product you're adding?"
		},
		{ //Product quantity
			type: "input",
			name: "quantity",
			message: "How many are you adding?"
		},
		{ //Product price
			type: "input",
			name: "price",
			message: "What is the price?"
		}])

		//Initiates the product inception in database
		.then(function(answer) {

		//Queries mysql with the new product requirements
		var query = connection.query(
			"INSERT INTO products SET ?",
			[
				{ //Requirements of the new product
					product: answer.product,
					quantity: answer.quantity,
					price: answer.price
				}
			],

			//Confirms product is created and returns the updated inventory table
			function(err, res) {
				console.log(res.affectedRows + " products added \n");
				allInventory();
			}
		);

	})
}

// ---------- Supervisor Section ----------


//This is the "supervise" store block
function overview() {
	inquirer

		//Asks supervisor what action they want to complete
		.prompt({
			name: "overview",
			type: "rawlist",
			message: "What would you like to do?",
			choices: [ //Sets out the supervisor functions
				"View Product Sales By Department",
				"Create New Department",
				"Close Department",
				"Return to main"
			]
		})

		//Validates user choice and initiates function
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

//This function displays the sales by department (INCOMPLETE)
function departmentSales() {
	console.log(chalk.underline.red("\nSales reports are under development\n"));
	overview();
}

//This function allows supervisor to create a new department (INCOMPLETE)
function createDepartment() {
	console.log(chalk.underline.red("\nNew Department function under development\n"));
	overview();
}

//This function allows supervisor to close a department (INCOMPLETE)
function closeDepartment() {
	console.log(chalk.underline.red("\nClose Department function under development\n"));
	overview();
}
