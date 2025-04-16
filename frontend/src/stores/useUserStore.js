import { create } from "zustand";
import axios from "../lib/axios";
import {toast} from "react-hot-toast";

export const useUserStore = create( (set, get) => ({
    user:null, 
    loading: false, 
    checingAuth: true,

    signup: async ({name, email, password, confirmPassword}) =>{
        set({loading: true});

        if(password !== confirmPassword){
            set({loading: false});
            return toast.error("Passwords Do Not Match");
        }

        try{
            const res = await axios.post("/auth/signup", {name, email, password});
            set({user: res.data.user, loading: false});
        } catch(error){
            set({loading: false})
            toast.error(error.response.data.message || "An Error Occurred. Try Again.");
        }
    },

    login: async (email, password) =>{
        set({loading: true});

        try {
            const res = await axios.post("/auth/login", {email, password});
            set({user: res.data.user, loading: false});

        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.message || "An error Occurred");
        }
    }, 


}));