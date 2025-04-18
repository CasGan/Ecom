import {create} from 'zustand';
import toast from 'react-hot-toast';
import axios from '../lib/axios';

export const useProductStore = create((set)=>({
    products: [],
    loading: false,
    setProducts: (products) => set({products}),

    createProduct: async (productData) => {
        set({loading: true});
        try {
            const res = await axios.post("/products", productData);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false, 
            }));
        } catch (error) {
            toast.error(error.response.data.error);
            set({loading: false});
        }
    },

    fetchAllProducts: async () =>{
        set({loading: true});
        try {
            const response = await axios.get("/products");
            set({products: response.data.products, loading: false});

        } catch (error) {
            set({error: "Failed to Fetch Products", loading: false});
            toast.error(error.response.data.error || "Failed To Fetch Products");
        }
    },
    
    fetchProductsByCategory: async (category) =>{
        set({loading: true});
        try {
            const response = await axios.get(`/products/category/${category}`);
            set({products: response.data.products, loading: false});
        } catch (error) {
            set({error: "Failed To Fetch Products", loading: false});
            toast.error(error.response.data.erro || "Failed To Fetch Products"); 
        }
    },

    deleteProduct: async (productId) =>{
        set({loading: true});
        try {
            await axios.delete(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false,
            }));
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.error || "Failed To Delete Product");
        }
    },

    toggleFeaturedProduct: async (productId) =>{
        set({loading: true});
        try {
            const response = await axios.patch(`/products/${productId}`);
            // updates the isFeatured prop of the product
            set((prevProducts) =>({
                products: prevProducts.products.map((product) =>
                    product._id === productId ? {...product, isFeatured: response.data.isFeatured} : product
                ),
                loading: false,
            })); 
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.error || "Failed To Update Product");
        }
    },
}));