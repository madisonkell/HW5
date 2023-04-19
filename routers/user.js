const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Product = require('../models/product')
const bcrypt = require('bcrypt')
const session = require('express-session')
const authenticateUser = require('../middleware/authenticateUser')

//creating users 
router.post('/users/register', async(req,res)=>{
    try{
        // check if user already exists
        const user = await User.findOne({user_name: req.body.user_name})
        if(user !== null){
            res.send("User already exists")
            return
        }
        // check if the balance was provided
        if (req.body.balance === undefined)
            req.body.balance = 100
        const u = new User({name:req.body.name, user_name:req.body.user_name, balance: req.body.balance, password: await bcrypt.hash(req.body.password,8)})
        await u.save()
        // make it so that the password isn't sent back
        const noPass = {_id:u._id,name:u.name,user_name:u.user_name,balance:u.balance, items:u.items}
        res.send(noPass)

    }catch(error){
        res.send({error:error})
    }
})

// route the allows the user to log in
// check if the user exists, and if they do compare the password they entered
// with the hashed password stored in the database
router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findOne({user_name:req.body.user_name})
        if(!user){
            res.send("Error logging in. Incorrect username/password")  
            return        
        }
        const match = await bcrypt.compare(req.body.password, user.password)
        if(!match){
            res.send("Error logging in. Incorrect username/password")  
            return
        }
        req.session.user_id = user._id
        res.send({message: "Successfully logged in. Welcome " + user.name})

    }catch(error){
        res.send({error:error})
    }
})


// get the information for the user that is currently logged in

router.get('/users/me', authenticateUser, async(req,res)=>{
    // get the users info including items
    try{
        const user = await User.findById(req.user._id).populate('items')
        const noPass = {_id:user._id,name:user.name,user_name:user.user_name,balance:user.balance, items:user.items}
        res.send(noPass)
    }catch(error){
        res.send({error:error})
    }
})

// new Post route to log user out

router.post('/users/logout',authenticateUser,(req,res)=>{
    req.session.destroy(()=>{
        res.send('Successfully logged out ' + req.user.name)
    })
})

//delete a single user as long as they exist
router.delete('/users/me', authenticateUser, async(req,res)=>{
    try{
        // delet the user and their items
        await User.deleteOne({user_name: req.user.user_name})
        // delete the session associated with the user
        req.session.destroy()
        res.send("User " + req.user.name + " was deleted")
    }catch(error){
        res.send({error:error})
    }
})

//returning the users and their items
router.get('/summary', async(req,res)=>{
    try{
        const users = await User.find({}).populate('items')
        const allUsers = users.map(u=> {return{_id:u._id,name:u.name,user_name:u.user_name,balance:u.balance, items:u.items}})
        res.send(allUsers)
    }catch(error){
        res.send({error:error})
    }



    // User.find({}).populate('items').exec((error,result)=>{
    //     if(error){
    //         res.send(error)
    //     }
    //     else{
    //         //maping the users in an array
    //         const allUsers = result.map(u=> {return{_id:u._id,name:u.name,user_name:u.user_name,balance:u.balance, items:u.items, id:u.id}})
    //         res.send(allUsers)
    //     }
           
    // })
})


module.exports = router
