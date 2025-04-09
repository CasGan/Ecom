import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectRoute = async(req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if(!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-password");

            if(!user) {
                return res.status(401).json({ message: "User Not Found" });
            }

            req.user = user; // Attach user to request object
            next(); 
            
            } catch (error) {
                if(error.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Unauthorized - Token Expired" });
                }
                throw error; // Pass other errors to the catch block
            }
    } catch (error) {
        console.log("Error in Protect Route Middleware: ", error.message);
        res.status(401).json({ message: "Unauthorized - Invalid Access token" });
    }
};

export const adminRoute = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next(); // User is admin, proceed to the next middleware or route handler
    } else {
        res.status(403).json({ message: "Access Denied - Admins Only" });
    }
};