import Coupon from "../models/coupon.model.js";


export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        res.json(coupon || null);
    } catch (error) {
        console.log("Error fetching coupon:", error.message);
        res.status(500).json({ message:"Server error", error: error.message });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        console.log("here")
        const coupon = await Coupon.findOne({ code: code, userId:req.user._id, isActive: true });

        console.log("Found Coupon: ", coupon);

        if(!coupon){
            return res.status(404).json({message:"Coupon Not Found "});
        }

        if(coupon.expirationDate < new Date()){
            coupon.isActive = false; 
            await coupon.save(); 
            return res.status(404).json({message:"Coupon Expired"});  
        }

        res.json({
            message:"Coupon Valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        })

    } catch (error) {
        console.log("Error validating coupon:", error);
        res.status(500).json({ message:"Server error", error: error.message });
        
    }
};