const jwt=require("jsonwebtoken")

const authenticate=(req,res,next)=>{
    const token=req.headers.authorization
    if(token){
        jwt.verify(token,"masai",(err,decoded)=>{
            if(decoded){
                req.body.user=decoded.userID
                //  res.send(req.body.user)
                next()
            }else{
                res.send({"msg":"Plese login again and put correct token "})
            }
        })
    }else{
        res.send({"msg":"Please Login first"})
    }
}

module.exports={authenticate}