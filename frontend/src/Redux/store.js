import { configureStore } from "@reduxjs/toolkit"

import AlertSlice from "./features/AlertSlice"


import AuthSlice from "./features/AuthSlice"

import UserSlice from "./features/UserSlice"

import BlogSlice from "./features/BlogSlice"


export default configureStore({

    reducer:{
        alerts:AlertSlice.reducer,
        auth:AuthSlice.reducer,
        user:UserSlice.reducer,
        blogs:BlogSlice.reducer
    }

})