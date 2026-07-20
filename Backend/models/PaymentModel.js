import mongoose from "mongoose";

const PaymentSchema= new mongoose.Schema(
    
    {

        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
            
        },

        property:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Property",
            required:true
        },

        amount:{
            type:Number,
            required:true
        },

        transactionId:{
            type:String,
            required:true,
            unique:true
        },

        status:{
            type:String,
            enum:["pending","completed","failed"],
            default:"pending"
        }


    }, 
    
    
    
    {
    timestamps: true
})

export  default mongoose.model("payment",PaymentSchema);