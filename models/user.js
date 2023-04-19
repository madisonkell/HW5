const mongoose = require('mongoose')
const Product = require('./product')

//create user schema for the user collection
const UserSchema = mongoose.Schema({
    name:{required:true,type:String},
    user_name:{type:String, unique:true},
    balance:{type:Number,default:100},
    password:{type:String}
})

//create virtual for users items
UserSchema.virtual('items',{
    ref:'Product',
    localField:'_id',
    foreignField:'owner'
})

UserSchema.set('toJSON',{virtuals:true})
UserSchema.set('toObject',{virtuals:true})


UserSchema.pre('save',function(next){
    next()
})
UserSchema.post('save',function(doc){
    //console.log(doc)
})

//middleware to delete a users items before deleting the user
UserSchema.pre('deleteOne',{document:true},function(next){
    console.log("Middleware deleting all posts for the user...")
    Product.deleteMany({owner:this._id},(error,result)=>{
        if(error)
            result.send(error)
        else{
            console.log("Deleted User")
            next()
        }
    })
})



const User = mongoose.model("User",UserSchema,"users")
module.exports = User