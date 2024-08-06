import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import Config from "../../Config";

// Async thunk action creator for fetching all blogs with pagination
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async ({ page = 1, limit = 10 }) => { // Default page and limit values
    const response = await axios.get(`${Config.apiUrl}/api/blog/get?page=${page}&limit=${limit}`);
    const data = response.data;
    return data;
  }
);

// Async thunk action creator for fetching a single blog post by its ID
export const fetchBlogById = createAsyncThunk(
  'blogs/fetchBlogById',
  async (blogId) => {
    const response = await axios.get(`${Config.apiUrl}/api/blog/get/${blogId}`);
    const data = response.data.data;
    return data;
  }
);

// Initial state
const initialState = {
  blogs: [],
  singleBlog: null,
  status: 'idle',
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

// Create slice
const BlogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Blogs reducers
      .addCase(fetchBlogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.blogs = action.payload.data; // Assuming data field contains array of blogs
        state.pagination.page = action.payload.page;
        state.pagination.limit = action.payload.limit;
        state.pagination.total = action.payload.total;
        state.pagination.totalPages = Math.ceil(action.payload.total / action.payload.limit);
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Fetch Single Blog reducers
      .addCase(fetchBlogById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.singleBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const blogsActions = { ...BlogSlice.actions, fetchBlogs, fetchBlogById };

export default BlogSlice;
