

//Set up MySQL connection

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",

	password: "########",

	database: "bamazon_db"
});

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
				"Overview (supervisor)"
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
			}
		})
}

// ---------- Customer Section ----------

function shop() {
	inquirer
		.prompt ({
			name: "shop",
			type: "rawlist",
			message: "which item would you like?"
			choices: [
				"Item 1"
			]
		})
		.then(function(answer) {
			switch (answer.shop) {
				case "Item 1"
					buy(item1);
					break;
			}
		})
}

function buy(item){
	//
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
			"Add new product"
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
			}
		});
}

function allInventory() {
	//
}

function lowInventory() {
	//
}

function addInventory() {
	//
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
