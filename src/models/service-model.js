const mongoose =require("mongoose")

const serviceSchema = new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    category:{type:String, required:true},
    price:{type:Number, required:true},
    // image:{type:String, required:true},
    availability:{type:Boolean, default:true},
    provider:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    createdAt:{type:Date, default:Date.now},
}, {collection:"services"})

module.exports = mongoose.model("Service", serviceSchema)