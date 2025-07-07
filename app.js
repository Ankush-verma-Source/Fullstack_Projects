if (process.env.NODE_ENV !== 'production') {
        require('dotenv').config();
}


const express = require('express');
const app = express();
const port=process.env.PORT;
const path = require('path');


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));


app.use((req,res)=>{
    res.render("index");
})







app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
