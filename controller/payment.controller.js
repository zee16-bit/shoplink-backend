const axios = require("axios")
const supabase = require("../config/supabase");
const { status, json } = require("express/lib/response");
const crypto = require("crypto")
require("dotenv").config()

const intialize = async(req,res)=>{
    try{
        const {email,amount}= req.body
        console.log(req.body)
        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {email,amount: amount*100},
            {
                headers: {
                    Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type":"application/json"
                }
            }
        );
        const reference = response.data.data.reference;
        await supabase.from("payments").insert([{
            reference,
            email,
            amount,
            status:"pending"
        }
        ])
        res.status(200).json(response.data.data)
        console.log(response.data.data)
    }catch(err){
        console.log(err.response?.data || err)
        res.status(500).json({message:"Payment initialization failed"})
    }
}

const verifyPayment =async(req,res)=>{
    try{
        const {reference} = req.params
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        )
        const payment = response.data.data
        if(payment.status === "success"){
            await supabase.from("payments").update({
                status: "success",
                paid_at: new Date()
            })
            .eq("reference",reference)
        }
        res.json(payment)
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Verification failed"})
    }
}

const webhook =async(req,res)=>{
    try{
        const hash = crypto.createHmac("sha512",process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex")
        if(hash !== req.headers["x-paystack-signature"]){
            return res.sendstatus(401)
        }
        const event = req.body
        if(event.event === "charge.success"){
            const paymentData = event.data
            await supabase.from("payments").update({
                status: "success",
                paid_at: new Date()
            })
            .eq("reference",paymentData.reference)
        }
        res.sendstatus(200)
    }catch(err){
        console.log(err)
        res.sendstatus(500)
    }
}


module.exports = {intialize,verifyPayment,webhook}