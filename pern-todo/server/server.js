const express = require("express")
const app = express()
const cors = require("cors")
const pool = require("./db")
const port = 3000

//middleware
app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

//Routes

//create a todo
app.post("/todos", async (req, res) => {
    try {
        const { description } = req.body;
        const newTodo = await pool.query(
            "INSERT INTO todo (description) VALUES($1) RETURNING *",
            [description] // defines $1
        )
        res.json(newTodo.rows[0])
    }
    catch (err) {
        console.error(err.message)
    }
})

//get all todos
app.get("/todos", async (req, res) => {
    try {
        const allTodos = await pool.query(
            "SELECT * FROM todo"
        )
        res.json(allTodos.rows) // returns all rows only
        // res.json(allTodos) // returns everything 
    } catch (err) {
        console.error(err.message)
    }
})

// get a todo
app.get("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params
        console.log(id)
        const todo = await pool.query(
            "SELECT * FROM todo WHERE todo_id=$1",
            [id]
        )
        res.json(todo.rows[0])
    } catch (err) {
        console.error(err.message)
    }
})

// update a todo
app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { description } = req.body
        const updateTodo = await pool.query(
            "UPDATE todo SET description = $1 WHERE todo_id=$2 ",
            [description, id]
        )
        res.json("updated the todo")
    } catch (err) {
        console.error(err.message)
    }
})

//delete a todo
app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params
        console.log(id)
        const todo = await pool.query(
            "DELETE FROM todo WHERE todo_id=$1",
            [id]
        )
        console.log(`todo with id = ${id} deleted`)
        res.json("deleted the todo")
    } catch (err) {
        console.error(err.message)
    }
})

app.listen(port, () => {
    console.log(`Server has started on port ${port}`)
})