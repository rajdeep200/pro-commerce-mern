const express = require('express')
const dotenv = require("dotenv")
const connectDB = require('./config/db')
const productRoutes = require("./routes/productRouter")
const userRoutes = require("./routes/userRouter")
const orderRoutes = require("./routes/orderRouter")

connectDB()
dotenv.config()
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running....')
})
app.use('/products', productRoutes )
app.use("/users", userRoutes )
app.use("/orders", orderRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`server is running on ${PORT}`))