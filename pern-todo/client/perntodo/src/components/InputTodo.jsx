import { useState, Fragment } from 'react'
const InputTodo = () => {
    const [description, setDescription] = useState("");
    async function submitted(e) {
        e.preventDefault()
        try {
            const body = { description }
            const response = await fetch("http://localhost:3000/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            window.location = "/" //to force a page refresh
        } catch (err) {
            console.log(err.message)
        }
    }
    return (
        <Fragment>
            <h1 className='text-center mt-5'>PERN Todo</h1>
            <form className='text-center mt-3' onSubmit={submitted}>
                <input
                    type="text"
                    value={description}
                    onChange={e => { setDescription(e.target.value) }}>
                </input>
                <button type="submit" className="btn btn-success">Add</button>
            </form>
        </Fragment>
    )
}

export default InputTodo