import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";


export const getAllProducts = async (req, res) => {
    try{
        const products = await Product.find({});    //find all products
        res.json({products})
    }catch(error){
        console.log("Error in Products Controller: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message});

    }
};


export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featuredProducts"); 

        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }
        //fetch from mongodb if not in redis
        //.lean returns plain javascript object instead of mongoose document
        // this is faster and uses less memory
        featuredProducts = await Product.find({isFeatured: true}).lean(); 

        if(!featuredProducts){
            return res.status(404).json({ message: "No featured products found" }); 
        }
        // store in redis for quick access 
        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.json(featuredProducts); // send response to client
    } catch (error) {
        console.log("Error in Featured Products Controller: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
        
    }
};


export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image, category} = req.body; 
        let cloudinaryResponse = null; 

        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder:"products"}); // upload image to cloudinary
        }

        const product = await Product.create({
            name, 
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category
        }); 
        
        res.status(201).json(product);

    } catch (error) {
        console.log("Error in Create Product Controller: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image){
            const publicId = product.image.split("/").pop().split(".")[0]; // get public id from image url

            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Deleted Image") // delete image from cloudinary
            } catch (error) {
                console.log("Error in Deleting Image:", error);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: "Product deleted successfully" }); 
    } catch (error) {
        console.log("Error in Delete Product Controller: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } }, 
            { $project: { 
                _id: 1,
                name: 1, 
                description: 1,
                image: 1, 
                price: 1
                } 
            } 
        ])
        res.json(products);
    } catch (error) {
        console.log("Error in Recommended Products Controller: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    try {
        const products = await Product.find({category}); // find products by category
        res.json(products); 
    } catch (error) {
        console.log("Error in Products by Category Controller: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); 

        if(product){
            product.isFeatured = !product.isFeatured; // toggle isFeatured property
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);

        }else{
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in Toggle Featured Product Controller: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

async function updateFeaturedProductsCache(){
    try {
        const featuredProducts = await Product.find({isFeatured: true}).lean(); // returns javascript object instead of mongoose document
        await redis.set("featured_products", JSON.stringify(featuredProducts)); // store in redis
    } catch (error) {
        console.log("Error in Updating Featured Products Cache: ", error.message);
        throw new Error("Error in Updating Featured Products Cache: " + error.message); // throw error to be caught in controller
    }
}