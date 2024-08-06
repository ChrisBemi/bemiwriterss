import React, { useState } from "react";
import "./login.css";
import "./authentication.css";
import Welcome from "./Welcome";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Config from "../../../Config";
import axios from "axios";

const ChangePassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
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
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(
          `${Config.baseUrl}/api/auth/change-password`,
          {
            token: token,
            newPassword: formData.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          console.log("Password was successfully changed");
          navigate("/login");
        } else {
          setErrors({ ...errors, confirmPassword: response.data.message });
        }
      } catch (error) {
        console.error("Error changing password:", error);
        // Handle the error as needed
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="authentication">
      <div className="authentication_form_container">
        <div className="container">
          <p className="medium-header">CHANGE PASSWORD</p>
          <form onSubmit={handleSubmit} className="authentication_form">
            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>
            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>
            <input
              type="submit"
              value="CHANGE PASSWORD"
              className="submit-btn"
              style={{ marginTop: "0.6rem" }}
            />
            <Link to="/login">Have an account? Login</Link>
          </form>
        </div>
      </div>
      <Welcome />
    </div>
  );
};

export default ChangePassword;
