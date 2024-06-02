import express from 'express'
import mongoose from 'mongoose'
import crypto from 'crypto'
import jsonwebtoken from 'jsonwebtoken'


mongoose.connect('mongodb://0.0.0.0:27017/Auth')

const schema=mongoose.Schema({
    name:String,
    email:String,
    pwd:String,
    role:String
})

const Usermodel=mongoose.model('user',schema)

const server=express()
server.use(express.json())


async function signInmiddleware(req,res,next){

    console.log(req.body.email)
    let users=await Usermodel.findOne({'email':req.body.email,'pwd':crypto.createHash('md5').update(req.body.pwd).digest('hex')})

    console.log(users)

    if(users){
        next()
    }else{

        res.status(400)
        res.send("Login error")
    }


}

server.post('/signin',signInmiddleware,(req,res)=>{

    let obj={
        email:req.body.email
    }
    let token=jsonwebtoken.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: obj
      }, 'mysecretvalue');

    res.send({status:"success",token})

})



server.post('/register',async (req,res)=>{

    let user={
    name:req.body.name,
    email:req.body.email,
    pwd:crypto.createHash('md5').update(req.body.pwd).digest('hex'),
    role:req.body.role
    }

    await Usermodel.create(user)

    res.send("Success")

})



async function validate(req,res,next){

        try{
        let header=req.headers
        console.log(header.authorization)
        console.log(header)
        let data=jsonwebtoken.verify(header.authorization,'mysecretvalue')
        console.log(data)
        next()
        }catch(err){
            res.status(400)
            res.send("invalid token")
        }
  

} 

server.post('/profile',validate,(req,res)=>{
    res.send("success")
})




server.listen(3000,()=>{
    console.log("running in 3000")
})