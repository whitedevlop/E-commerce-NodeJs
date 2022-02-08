const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

// LOAD ENV VARS
dotenv.config({path: './config/config.env'});


// Protection token 
const authJwt = require('./helpers/jwt');
const errorHandler = require("./helpers/error-handler");
//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

// Routes
const categoriesRoutes = require('./routes/categories'); 
const productsRoutes = require('./routes/products')
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

// @desc            Defining API_URL in api variable
const api = process.env.API_URL;

// Routers
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// Database
mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(() =>{
    console.log("Database connection is ready...");
})
.catch((err) =>{
    console.log(err);
})

// Server
app.listen(3000, ()=>{
    console.log('Server is running http://localhost:3000');
})

// HANDLE UNHANDLE PROMISE TOGETHER
process.on('UnhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // close and exit process
    server.close(()=>process.exit(1));
});