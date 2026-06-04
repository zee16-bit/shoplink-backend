const express = require("express")
const cors = require("cors")
const app = express()
const paymentRoutes = require("./routes/payment.route")
app.use(cors())
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use("/api/payment", paymentRoutes)
app.listen(5000,(err)=>{
    if(err){
        console.log(err)
    }
    console.log("Server is running at PORT 5001")
})