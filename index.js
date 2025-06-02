import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import jwt from 'jsonwebtoken';
import productRouter from './routes/productRouter.js';
import verifyJWT from './middleware/auth.js';
import orderRouter from './routes/orderRouter.js';
import dotenv from 'dotenv';
dotenv.config()
import cors from 'cors';
const app = express();
app.use(cors())

mongoose.connect(process.env.MONGO_URL).then(
    () => {
        console.log("Database Connected");
    }
).catch(
    () => {
        console.log("Connection Faild")
    }
)

app.use(bodyParser.json());
app.use(verifyJWT)


app.use("/api/user", userRouter)
app.use("/api/product", productRouter)
app.use("/api/order", orderRouter),

app.listen(3000, () => {
    console.log("Port 3000 is runing");
})



