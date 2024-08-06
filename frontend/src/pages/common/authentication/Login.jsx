import React, { useContext, useState } from "react";
import "./login.css";
import "./authentication.css";
import Welcome from "./Welcome";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../../AuthContext";
import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";
import Preloader from "../../../Preloader/Preloader";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Login = () => {
  const { isAuthenticated, login } = useContext(AuthContext);
  const loading = useSelector((state) => state.alerts.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validate = () => {
    let errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      try {
        dispatch(showLoading())
        const success = await login(formData.email, formData.password);
        dispatch(hideLoading())
        if (success) {
          navigate("/client/get-orders");
        } else {
          toast.error("Input correct email or password");
        }
      } catch (error) {
        toast.error("Network or server errors encountered");
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="authentication">
      <div className="authentication_form_container">
        <div className="container">
          <ToastContainer position="top-center" />
          <div className="medium-header">LOGIN</div>
          <form onSubmit={handleSubmit} className="authentication_form">
            <div className="input-group">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>
            <input
              type="submit"
              value="LOGIN"
              className="submit-btn"
              style={{ marginTop: "0.6rem" }}
            />
            <div className="row">
              <Link to="/forgot-password">Forgot password?</Link>
              <Link to="/signup" className="signup-link">Signup</Link>
            </div>
          </form>
        </div>
      </div>
      <Welcome />
      {loading && <Preloader />}
    </div>
  );
};

export default Login;
