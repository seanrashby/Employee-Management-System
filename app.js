const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const clear = require('console-clear');
const chalk = require('chalk');

//-----DB connection
const connection = mysql.createConnection({
    //host and port
    host: "localhost",
    port: 3306,
    //credentials
    user: "root",
    password: "Mysqlpw12!@",
    database: "employeesDB"
});
connection.connect(function(err) {
    if (err) throw err;
    //start app on DB connection
    startApp();
});

//-----start app with initial prompt
function startApp(){
    //clear console
    clear();
    //render header
    renderHeader()
    //menu prompt
    menuPrompt();
}

//-----render functions

//render header
function renderHeader(){
    console.log(chalk.hex("#00FFFF")(String.raw`
   SalesTech Inc`));
   console.log(chalk.dim("  Employee Database\n"));
}

//render table data and menu prompt
function renderScreen(tableTitle, tableData){
    //clear console
    clear();
    //render header
    renderHeader();
    //log table title to console in inverse colors
    console.log(chalk.inverse.bold(tableTitle));
    //log table to console
    console.table(tableData);
    //menu prompt
    menuPrompt();
}

//-----prompts

//initial prompt - which type of query?
function menuPrompt(){
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Make a selection:",
            choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", chalk.red("Exit Program")]
          })
        .then(answer => {
            switch(answer.promptChoice){
                case "View All Employees":
                queryEmployeesAll();
                break;

                case "View All Employees by Department":
                queryDepartments();
                break;

                case "View All Employees by Manager":
                queryManagers();
                break;

                case "Add Employee":
                addEmployee();
                break;

                case "Remove Employee":
                removeEmployee();
                break;

                case "Update Employee Role":
                updateEmployeeRole();
                break;

                case "Update Employee Manager":
                updateEmployeeManager();
                break;

                case "\u001b[31mExit Program\u001b[39m":
                clear();
                process.exit();                
            }             
        });
}

//department prompt
function promptDepartments(departments){
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Select Department:",
            choices: departments
          })
        .then(answer => {
            queryEmployeesByDepartment(answer.promptChoice);            
        });
}

//manager prompt
function promptManagers(managers){
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Select Manager:",
            choices: managers
          })
        .then(answer => {
            queryEmployeesByManager(answer.promptChoice);            
        });
}

//-----queries

//query all employees
function queryEmployeesAll(){
    //sql query
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department_name, concat(manager.first_name, " ", manager.last_name) AS manager_full_name
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON department.id = role.department_id
	LEFT JOIN employee as manager ON employee.manager_id = manager.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //build table data array from query result
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({ 
                "ID": res[i].id, 
                "First Name": res[i].first_name,
                "Last Name": res[i].last_name,
                "Role": res[i].title,
                "Salary": res[i].salary, 
                "Department": res[i].department_name,
                "Manager": res[i].manager_full_name
            });
        }
        //render screen
        renderScreen("All Employees", tableData);
    });
}

//query all departments
function queryDepartments(){
    //sql query
    const query = `SELECT department.name FROM department;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract department names to array
        const departments = [];
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }
        //prompt for department selection
        promptDepartments(departments)
    });
}

//query all managers
function queryManagers(){
    //sql query
    const query = `
    SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name
    FROM employee
    LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract manager names to array
        const managers = [];
        for (let i = 0; i < res.length; i++) {
            managers.push(res[i].full_name);
        }
        //prompt for manager selection
        promptManagers(managers);
    });
}

//query employees by department
function queryEmployeesByDepartment(department){
    //sql query
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, concat(manager.first_name, " ", manager.last_name) AS manager_full_name
    FROM employee 
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN employee AS manager ON employee.manager_id = manager.id
    INNER JOIN department ON department.id = role.department_id
    WHERE department.name = "${department}";`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //build table data array from query result
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({ 
                "ID": res[i].id, 
                "First Name": res[i].first_name,
                "Last Name": res[i].last_name,
                "Role": res[i].title,
                "Salary": res[i].salary, 
                "Manager": res[i].manager_full_name
            });
        }
        //render screen
        renderScreen(`${department} Department`, tableData);
    });
}

//query employees by manager
function queryEmployeesByManager(manager){
    //sql query
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department_name, concat(manager.first_name, " ", manager.last_name) AS manager_full_name 
    FROM employee 
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN employee AS manager ON employee.manager_id = manager.id
    INNER JOIN department ON department.id = role.department_id
    WHERE concat(manager.first_name, " ", manager.last_name) = "${manager}";`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //build table data array from query result
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({ 
                "ID": res[i].id, 
                "First Name": res[i].first_name,
                "Last Name": res[i].last_name,
                "Role": res[i].title,
                "Salary": res[i].salary, 
                "Department": res[i].department_name
            });
        }
        //render screen
        renderScreen(`Employees managed by ${manager}`, tableData);
    });
}

//-----add / remove / update functions

//add employee
function addEmployee(){
    //initialize newEmployee object
    const newEmployee = {
        firstName: "",
        lastName: "", 
        roleID: 0, 
        managerID: 0
    };
    //new employee name prompt
    inquirer
        .prompt([{
            name: "firstName",
            message: "Enter first name: "
            }, {
            name: "lastName",
            message: "Enter last name: "
            }])
        .then(answers => {
            //set newEmployee name
            newEmployee.firstName = answers.firstName;
            newEmployee.lastName = answers.lastName;
              
            //sql query for roles
            const query = `SELECT role.title, role.id FROM role;`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                //extract role names and ids to arrays
                const roles = [];
                const rolesNames = [];
                for (let i = 0; i < res.length; i++) {
                    roles.push({
                        id: res[i].id,
                        title: res[i].title
                    });
                    rolesNames.push(res[i].title);
                }
                //prompt for role selection
                inquirer
                .prompt({
                    type: "list",
                    name: "rolePromptChoice",
                    message: "Select Role:",
                    choices: rolesNames
                  })
                .then(answer => {
                    //get id of chosen role
                    const chosenRole = answer.rolePromptChoice;
                    let chosenRoleID;
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].title === chosenRole){
                            chosenRoleID = roles[i].id;
                        }
                    }
                    //set newEmployee role ID 
                    newEmployee.roleID = chosenRoleID;
                    //sql query for managers
                    const query = `
                    SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name, manager.id
                    FROM employee
                    LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;
                    connection.query(query, (err, res) => {
                        if (err) throw err;
                        //extract manager names and ids to arrays
                        const managers = [];
                        const managersNames = [];
                        for (let i = 0; i < res.length; i++) {
                            managersNames.push(res[i].full_name);
                            managers.push({
                                id: res[i].id,
                                fullName: res[i].full_name
                            });
                        }
                        //prompt for manager selection
                        inquirer
                        .prompt({
                            type: "list",
                            name: "managerPromptChoice",
                            message: "Select Manager:",
                            choices: managersNames
                          })
                        .then(answer => {
                            //get id of chosen manager
                            const chosenManager = answer.managerPromptChoice;   
                            let chosenManagerID;
                            for (let i = 0; i < managers.length; i++) {
                                if (managers[i].fullName === chosenManager){
                                    chosenManagerID = managers[i].id;
                                    break;
                                }
                            }
                            //set newEmployee manager ID
                            newEmployee.managerID = chosenManagerID;
                            //add employee insert sql query
                            const query = "INSERT INTO employee SET ?";
                            connection.query(query, {
                                first_name: newEmployee.firstName,
                                last_name: newEmployee.lastName,
                                role_id: newEmployee.roleID || 0,
                                manager_id: newEmployee.managerID || 0
                                }, (err, res) => {
                                if (err) throw err;
                                console.log("Employee Added");
                                //show updated employee table
                                setTimeout(queryEmployeesAll, 500);
                            });                            
                        });
                    });
                });
            });            
        });
}

function removeEmployee(){
    //sql query for Employees
    const query = `
    SELECT id, concat(employee.first_name, " ", employee.last_name) AS employee_full_name
    FROM employee ;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract employee names and ids to arrays
        let employees = [];
        let employeesNames = [];
        for (let i=0;i<res.length;i++){
            employees.push({
                id: res[i].id,
                fullName: res[i].employee_full_name});
            employeesNames.push(res[i].employee_full_name);
        }
        //prompt for employee to remove
        inquirer
        .prompt({
            type: "list",
            name: "employeePromptChoice",
            message: "Select employee to delete:",
            choices: employeesNames
          })
        .then(answer => {
            //get id of chosen employee
            const chosenEmployee = answer.employeePromptChoice;
            let chosenEmployeeID;
            for (let i = 0; i < employees.length; i++) {
              if (employees[i].fullName === chosenEmployee) {
                chosenEmployeeID = employees[i].id;
                break;
              }
            }
            //remove employee sql query
            const query = "DELETE FROM employee WHERE ?";
            connection.query(query, {id: chosenEmployeeID}, (err, res) => {
                if (err) throw err;
                console.log("Employee Removed");
                //show updated employee table
                setTimeout(queryEmployeesAll, 500);
            });       
        });
    });
}

function updateEmployeeRole(){
    //initialize updatedEmployee object
    const updatedEmployee = {
        id: 0,
        roleID: 0, 
    };
    //sql query for Employees
    const query = `
    SELECT id, concat(employee.first_name, " ", employee.last_name) AS employee_full_name
    FROM employee ;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract employee names and ids to arrays
        let employees = [];
        let employeesNames = [];
        for (let i=0;i<res.length;i++){
            employees.push({
                id: res[i].id,
                fullName: res[i].employee_full_name});
            employeesNames.push(res[i].employee_full_name);
        }
        //prompt for employee to update
        inquirer
        .prompt({
            type: "list",
            name: "employeePromptChoice",
            message: "Select employee to update:",
            choices: employeesNames
          })
        .then(answer => {
            //get id of chosen employee
            const chosenEmployee = answer.employeePromptChoice;
            let chosenEmployeeID;
            for (let i = 0; i < employees.length; i++) {
              if (employees[i].fullName === chosenEmployee) {
                chosenEmployeeID = employees[i].id;
                break;
              }
            }
            //set updatedEmployee id
            updatedEmployee.id = chosenEmployeeID;
            //sql query for roles
            const query = `SELECT role.title, role.id FROM role;`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                //extract role names and ids to arrays
                const roles = [];
                const rolesNames = [];
                for (let i = 0; i < res.length; i++) {
                    roles.push({
                        id: res[i].id,
                        title: res[i].title
                    });
                    rolesNames.push(res[i].title);
                }
                //prompt for role selection
                inquirer
                .prompt({
                    type: "list",
                    name: "rolePromptChoice",
                    message: "Select Role:",
                    choices: rolesNames
                })
                .then(answer => {
                    //get id of chosen role
                    const chosenRole = answer.rolePromptChoice;
                    let chosenRoleID;
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].title === chosenRole){
                            chosenRoleID = roles[i].id;
                        }
                    }
                    //set updatedEmployee role ID 
                    updatedEmployee.roleID = chosenRoleID;
                    //sql query to update role
                    const query = `UPDATE employee SET ? WHERE ?`;
                    connection.query(query, [
                        {
                          role_id: updatedEmployee.roleID
                        },
                        {
                          id: updatedEmployee.id
                        }
                        ], (err, res) => {
                        if (err) throw err;
                        console.log("Employee Role Updated");
                        //show updated employee table
                        setTimeout(queryEmployeesAll, 500);
                    });
                });
            });            
        });
    });
}

function updateEmployeeManager(){
    //initialize updatedEmployee object
    const updatedEmployee = {
        id: 0,
        managerID: 0
    };
    //sql query for Employees
    const query = `
    SELECT id, concat(employee.first_name, " ", employee.last_name) AS employee_full_name
    FROM employee ;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract employee names and ids to arrays
        let employees = [];
        let employeesNames = [];
        for (let i=0;i<res.length;i++){
            employees.push({
                id: res[i].id,
                fullName: res[i].employee_full_name});
            employeesNames.push(res[i].employee_full_name);
        }
        //prompt for employee to update
        inquirer
        .prompt({
            type: "list",
            name: "employeePromptChoice",
            message: "Select employee to update:",
            choices: employeesNames
          })
        .then(answer => {
            //get id of chosen employee
            const chosenEmployee = answer.employeePromptChoice;
            let chosenEmployeeID;
            for (let i = 0; i < employees.length; i++) {
              if (employees[i].fullName === chosenEmployee) {
                chosenEmployeeID = employees[i].id;
                break;
              }
            }
            //set updatedEmployee id
            updatedEmployee.id = chosenEmployeeID;
            //sql query for managers
            const query = `
            SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name, manager.id
            FROM employee
            LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                //extract manager names and ids to arrays
                const managers = [];
                const managersNames = [];
                for (let i = 0; i < res.length; i++) {
                    managersNames.push(res[i].full_name);
                    managers.push({
                        id: res[i].id,
                        fullName: res[i].full_name
                    });
                }
                //prompt for manager selection
                inquirer
                .prompt({
                    type: "list",
                    name: "managerPromptChoice",
                    message: "Select Manager:",
                    choices: managersNames
                  })
                .then(answer => {
                    //get id of chosen manager
                    const chosenManager = answer.managerPromptChoice;   
                    let chosenManagerID;
                    for (let i = 0; i < managers.length; i++) {
                        if (managers[i].fullName === chosenManager){
                            chosenManagerID = managers[i].id;
                            break;
                        }
                    }
                    //set newEmployee manager ID
                    updatedEmployee.managerID = chosenManagerID;
                    //sql query to update manager
                    const query = `UPDATE employee SET ? WHERE ?`;
                    connection.query(query, [
                        {
                          manager_id: updatedEmployee.managerID
                        },
                        {
                          id: updatedEmployee.id
                        }
                        ], (err, res) => {
                        if (err) throw err;
                        console.log("Employee Role Updated");
                        //show updated employee table
                        setTimeout(queryEmployeesAll, 500);
                    });              
                });
            });
        });
    });
}