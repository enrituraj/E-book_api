import express from "express";
const app = express();


// Routes
app.get("/",(req,res)=>{
    res.json({"ritu":"good boy"})
})


export default app;