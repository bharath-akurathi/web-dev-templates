import { useState, useEffect, Fragment } from 'react'
import EditTodo from './EditTodo'
const ListTodos = () => {
    const [todos, setTodos] = useState([])
    const getTodos = async () => {
        try {
            const response = await fetch("http://localhost:3000/todos")
            const jsonData = await response.json()
            setTodos(jsonData)
        } catch (err) {
            console.log(err.message)
        }
    }

    const deleteTodo = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/todos/${id}`, {
                method: "DELETE"
            })
            console.log("deleted todo")
            setTodos(todos.filter(todo => (todo.todo_id != id)))
        } catch (err) {
            console.log(err.message)
        }
    }

    useEffect(() => {
        getTodos();
    }, [])

    console.log(todos)

    return (
        <Fragment>
            {" "}
            <table className="table mt-5 text-center">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {/*<tr>
                    <td>John</td>
                    <td>Doe</td>
                    <td>john@example.com</td>
                    </tr> */}
                    {todos.map(todo => (
                        <tr key={todo.todo_id}>
                            <td>{todo.description}</td>
                            <td><EditTodo todo={todo}/></td>
                            <td>
                                <button type="button"
                                    className="btn btn-danger"
                                    onClick={() => deleteTodo(todo.todo_id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Fragment>
    )
}
export default ListTodos