import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth.js"

dotenv.config()

const app = express();

app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use("/api/auth", authRouter)

const port = process.env.PORT || 3000;

app.get("/",(req,res)=>{
    res.send("PERN auth")
})

app.use((err, req, res, _next) => {
    console.error(err);

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON payload" });
    }

    return res.status(err.status || 500).json({ message: "Something went wrong" });
})

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})
