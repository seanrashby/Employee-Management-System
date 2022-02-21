USE employeesDB;

INSERT INTO department (id, name)
VALUES 
(1, "Management"), 
(2, "Engineering"), 
(3, "Sales"), 
(4, "Marketing");

INSERT INTO role (id, title, salary, department_id)
VALUES 
(1, "CEO", 100000, 1), 
(2, "Product Manager", 80000, 1), 
(3, "Senior Engineer", 80000, 2),
(4, "Junior Engineer", 80000, 2),
(5, "Sales Lead", 80000, 3),
(6, "Creative Director", 80000, 4),
(7, "Social Media Manager", 60000, 4);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES 
(1, "Dave", "Doe", 1, 1), 
(2, "Joe", "Smith", 2, 1), 
(3, "Steve", "Dee", 3, 1), 
(4, "Gary", "Veesuchs", 4, 3), 
(5, "Neem", "Donk", 5, 1), 
(6, "Harpy", "Puckchumbo", 6, 1),
(7, "Tew", "Chainz", 7, 6);


SELECT * FROM employee;
SELECT * FROM role;
SELECT * FROM department;