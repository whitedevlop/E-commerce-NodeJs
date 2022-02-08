const {User} = require('../models/user');
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc        Get all users
// @route       GET /api/v1/users
// @access      public
router.get(`/`,async(req,res)=>{
    const userList = await User.find( ).select("-passwordHash");

    if(!userList){
        res.status(500).json({success: false});
    }
      res.send(userList);
  })

//   @desc          Get a single user
// @route           GET /api/v1/users/:id
// @access          public
router.get('/:id', async(req,res)=>{
    const userList = await User.findById(req.params.id).select("-passwordHash");

    if(!userList){
        res.status(500).json({success:false});
    }
    res.send(userList);
})

    // @desc      Create a new user
  // @route     POST /api/v1/users
  // @access    private
  router.post(`/`,async(req,res)=>{
  
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();  
    if(!user)
    return res.status(400).send('The user cannot be created');

    res.send(user);
  });
  
// @desc        Login 
// @route       POST /api/v1/users/login
// @access      public
router.post('/login', async(req, res)=>{
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash )){
        const token = jwt.sign( {
            userId: user.id,
            isAdmin: user.isAdmin
        },secret,{expiresIn: '1d'}
         )
        res.status(200).send({user: user.email, token: token});
    }else{
        res.status(400).send("Password did not match");
    }
})

    // @desc      Register a new user
  // @route     POST /api/v1/users/login
  // @access    private
  router.post(`/register`,async(req,res)=>{
  
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();  
    if(!user)
    return res.status(400).send('The user cannot be registered');

    res.send(user);
  });

// @desc      Get count of all users
// @route     GET /api/v1/users/get/count
// @access    private
router.get('/get/count', async(req,res)=>{
    let userCount = await User.countDocuments();
    if(!userCount)
    return res.status(500).json({success:false});
    
    res.status(200).send({
      userCount: userCount
    });
  }) 

// @desc        Delete a user by id
// @route       DELETE/api/v1/user/:id
// @access      private 
router.delete('/:id',(req, res)=>{
    User.findByIdAndDelete(req.params.id).then(user =>{
        if(user){
            return res.status(200).json({success: true, message: "The user is deleted "});
        }else{
            return res.status(404).json({success: false, message: "User not found"});
        }
    }).catch(err =>{
        return res.status(400).json({success: false, error: err});
    })
  })

  module.exports = router;