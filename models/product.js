const mongoose = require('mongoose')

//create product schema for the product collection
const ProductSchema = mongoose.Schema({
    name:{required:true,type:String},
    price:{type:Number,required:true},
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

const Product = mongoose.model("Product",ProductSchema,"products")
module.exports = Product