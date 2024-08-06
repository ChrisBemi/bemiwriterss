import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { clearUser } from "./Redux/features/AuthSlice";
import Config from "./Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headers from "./headers";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = sessionStorage.getItem("isAuthenticated");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${Config.baseUrl}/api/auth/status`, {
          headers, // Include headers in the request configuration
          withCredentials: true, // Send cookies with the request if needed
        });
        if (response.data.isLoggedIn) {
          setIsAuthenticated(true);
          sessionStorage.setItem("isAuthenticated", true);
          sessionStorage.setItem("userId", response.data.user_id);
        } else {
          dispatch(clearUser());
          setIsAuthenticated(false);
          sessionStorage.removeItem("isAuthenticated");
          sessionStorage.removeItem("userId");
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("userId");
        dispatch(clearUser());
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/auth/login`,
        { email, password },
        { headers, withCredentials: true }
      );
      if (response.data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("isAuthenticated", true);
        sessionStorage.setItem("userId", response.data.user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${Config.baseUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setIsAuthenticated(false);
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("isAuthenticated");
      dispatch(clearUser());
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
