const express = require('express');
const app = express();
const port=3000;


app.use((req,res)=>{
    res.send("server is running");
})


app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
