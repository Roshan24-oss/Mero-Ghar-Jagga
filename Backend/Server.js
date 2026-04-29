import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app=express();
app.use(cors());

app.get('/', (req,res)=>{
    res.send("Server is running");
})

mongoose.connect(process.env.MOngo_URI)
.then(()=>console.log("Connected to MongoDB" ))
.catch(err=>console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})