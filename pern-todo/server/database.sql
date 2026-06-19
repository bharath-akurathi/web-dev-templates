CREATE DATABASE perntodo;
-- the serial data type is a convenient shorthand for creating an auto-incrementing column.
-- Automatic Numbering: It automatically generates and assigns a unique integer value to each new row added to the table.
CREATE TABLE todo(
    todo_id SERIAL PRIMARY KEY, 
    description VARCHAR(255)
)