import React, { useState } from "react";

import "./login.css";

import "./authentication.css";

import Welcome from "./Welcome";

import { Link, useNavigate } from "react-router-dom";

import Config from "../../../Config";

import { useDispatch, useSelector } from "react-redux";

import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";

import Preloader from "../../../Preloader/Preloader";

import axios from "axios";

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear the error for the field being changed
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
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      dispatch(showLoading());

      const response = await axios.post(
        `${Config.baseUrl}/api/auth/forgot-password`,
        {
          email: formData.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dispatch(hideLoading());

      console.log("Form submitted successfully:");

      setSuccess(true);

      if (response.data.success) {
        console.log("Password reset link sent to the gmail");
      } else {
        if (response.data.email) {
          setErrors({ ...errors, email: response.data.email });
        }
      }

      // navigate("/change-password");
    } else {
      setErrors(validationErrors);
      dispatch(hideLoading());
    }
  };

  return (
    <div className="authentication">
      <div className="authentication_form_container">
        <div className="container">
          <p className="medium-header">GET CHANGING LINK</p>
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
            <input
              type="submit"
              value={success ? "CHECK EMAIL FOR RESET LINK" : "CHANGE PASSWORD"}
              className="submit-btn"
              style={{ marginTop: "0.6rem" }}
            />
            <Link to="/login">Have an account? Login</Link>
          </form>
        </div>
      </div>
      <Welcome />
      {loading && <Preloader />}
    </div>
  );
};

export default ForgotPassword;
