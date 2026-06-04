const express = require("express")
const route = express.Router()
const {intialize,verifyPayment,webhook} = require("../controller/payment.controller")
route.post("/initialize",intialize)
route.get("/verify/:reference",verifyPayment)
route.post("/webhook",webhook)

module.exports = route