const express = require('express')
const router = new express.Router()
const Product = require('../models/product')
const User = require('../models/user')
const authenticateUser = require('../middleware/authenticateUser')


//returning all of the products (without users)
router.get('/products', async(req,res)=>{
    try{
        res.send(await Product.find({}))
    }catch(error){
        res.send({error:error})
    }
})


//creating product
router.post('/products',authenticateUser, async(req,res)=>{
    try{
        let newProd = new Product({name:req.body.name, price: req.body.price, owner:req.user._id})
        res.send(await newProd.save())
    }catch(error){
        res.send({error:error})
    }
})

//deleting product by id
router.delete('/products/:id',authenticateUser, async(req,res)=>{
    try{
        const p = await Product.findById(req.params.id)
        if(!p){
            res.send('item does not exist')
            return
        }
        if(p.owner.toString() !== req.user._id.toString()){
            res.send("You are not authorized to peform this operation")
            return
        }
        await Product.deleteOne({_id: p._id})
        res.send("Product was deleted")

    }catch(error){
        res.send({error:error})
    }
})


//post request to buy item
router.post('/products/buy',authenticateUser, async(req,res)=>{
    try{
        // find the product and make sure it exists
        const p = await Product.findById(req.body.productID)
        if(!p){
            res.send("Product doesn't exist")
            return
        }
        // make sure the buyer doesn't own the item already
        if(p.owner.toString() === req.user._id.toString()){
            res.send("Oops, "+ req.user.name + " already owns this item")
            return
        }
        // check if the user has enough money
        if(p.price > req.user.balance){
            res.send("Oops, " + req.user.name + " has insufficient funds")
            return
        }
        // find the seller
        const seller = await User.findById(p.owner)
        let sBalance = seller.balance += p.price
        let bBalance = req.user.balance -= p.price
        // update the buyers and sellers balance
        await User.updateOne({_id:p.owner}, {balance: sBalance})
        await User.updateOne({_id:req.user._id}, {balance:bBalance})
        // update the items owner
        await Product.updateOne({_id: p._id}, {owner:req.user._id})
        res.send('Transaction successful!')
  
    }catch(error){
        res.send({error:error})
    }
})

module.exports=router