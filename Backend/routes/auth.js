const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET="Ambikeshisacoder"  


const router = express.Router();

//Route 1 Create a User using :POST "/api/auth/createUser" . No login required
router.post('/createuser' ,[
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be of length 5').isLength({ min: 5 }), 
], async(req,res)=>{ 
    //If there are errors , return Bad request and the errors
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    } 
    //Check whether user with this email exists already
    try{

    let user = await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({success,error:"Sorry a user with this email already exists"});
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt);
    // create a new user
   user=await User.create({
        name: req.body.name,
        password: secPass,
        email:req.body.email,  
      });
    //   .then(user => res.json(user)) 
    //   .catch(err=>{console.log(err)
    //   res.json({error : 'Please enter a unique value for email'}) })
    
    // console.log(req.body);  
    // const user = User(req.body);
    // user.save(); 
    // res.send(req.body); 
    const data={
        user:{
            id:user.id
        }
    }
    const authtoken = jwt.sign(data,JWT_SECRET);
    // console.log(authtoken);
    success=true;
    res.json({success,authtoken});  
    } catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server error");
    }
})
// route 2 Authenticate a User using :POST "/api/auth/login" . No login required
router.post('/login' ,[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(), 
], async(req,res)=>{ 
    let success=false;
    //If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } 
   const{email,password} = req.body;
   try{
       let user =await User.findOne({email});
       if(!user){
        return res.status(400).json({error:"Please try to login with correct credentials , no user"});
       }

       const passwordCompare= await bcrypt.compare(password,user.password);
       if(!passwordCompare){
           success=false;
        return res.status(400).json({success,error:"Please try to login with correct credentials"});
       }
       const data={
        user:{
            id:user.id
        }
        }
    const authtoken = jwt.sign(data,JWT_SECRET);
    success=true;
    // console.log(authtoken);
    res.json({success,authtoken});  
    } catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server error");
    }

   

});

//ROUTE 3:gET loggedin user details using : POST "/api/auth/getUser" . Login required
router.post('/getUser' ,fetchUser , async(req,res)=>{ 

try {
    userId=req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user);
} catch (error) {
    console.error(error.message);
        res.status(500).send("Internal Server error");
}
})
module.exports = router 