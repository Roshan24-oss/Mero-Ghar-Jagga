import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req,res, next)=>{
  try {
    const token = req.cookies.token;
    if(!token){
      return res.status(401).json({ message: "No token, authorization denied" });


    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    const user = await Usr.findById(decoded.id);
    if(!user) return res.status(401).json({ message: "User not found, authorization denied" });

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token is not valid" });
  }
}

export default authMiddleware;