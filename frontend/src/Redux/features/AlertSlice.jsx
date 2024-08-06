import { createSlice } from "@reduxjs/toolkit"

const AlertSlice = createSlice({

    name:"alerts",
    initialState:{
        loading:false   
    },
    reducers:{
        showLoading:(state)=>{
            state.loading = true;
        },
        hideLoading:(state)=>{
            state.loading = false
        }
    }

})

export const { showLoading,hideLoading } = AlertSlice.actions;

export default AlertSlice;