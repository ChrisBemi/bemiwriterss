import React, { useState } from "react";
import "./authentication.css";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import Config from "../../../Config";

import axios from "axios";

import Preloader from "../../../Preloader/Preloader";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { hideLoading, showLoading } from "../../../Redux/features/AlertSlice";

import { useDispatch, useSelector } from "react-redux";

import headers from "../../../headers";

const Signup = () => {
  const navigate = useNavigate();

  const loading = useSelector((state) => state.alerts.loading);

  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    qualification: "",
    educationLevel: "undergraduate",
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
    let validationErrors = {};

    if (!formData.firstName)
      validationErrors.firstName = "First name is required";
    if (!formData.lastName) validationErrors.lastName = "Last name is required";
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Email address is invalid";
    }
    if (!formData.phone) {
      validationErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      validationErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.password) {
      validationErrors.password = "Password is required";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}/.test(formData.password)
    ) {
      validationErrors.password = "Use strong password";
    }
    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.confirmPassword !== formData.password) {
      validationErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.qualification) {
      validationErrors.qualification = "Qualification is required";
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      try {
        dispatch(showLoading());

        const response = await axios.post(
          `${Config.baseUrl}/api/auth/signup`,
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNo: formData.phone,
            password: formData.password,
            qualifications: formData.qualification,
            educationLevel: formData.educationLevel,
          },
          {
            headers,
          }
        );
        dispatch(hideLoading());
        console.log(response.data);
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          if (response.data.phone) {
            setErrors({ ...errors, phone: response.data.phone });
          }
          if (response.data.email) {
            setErrors({ ...errors, email: response.data.email });
          }
        }
      } catch (error) {
        console.error("Error during signup:", error);
      }
    } else {
      setErrors(validationErrors);
      dispatch(hideLoading());
    }
  };

  return (
    <div className="signup-page">
      <div className="container">
        <ToastContainer />
        <p className="medium-header">MAKE APPLICATIONS</p>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="input-group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter firstname.."
              />
              {errors.firstName && (
                <span className="error">{errors.firstName}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter lastname.."
              />
              {errors.lastName && (
                <span className="error">{errors.lastName}</span>
              )}
            </div>
          </div>
          <div className="input-group rich-input">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone.."
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
            <i className="fa-solid fa-phone"></i>
          </div>
          <div className="input-group rich-input">
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email.."
            />
            {errors.email && <span className="error">{errors.email}</span>}
            <i className="fa-solid fa-envelope"></i>
          </div>

          <div className="row">
            <div className="input-group rich-input">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password.."
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="input-group rich-input">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password.."
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
              <i className="fa-solid fa-lock"></i>
            </div>
          </div>
          <div className="input-group">
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
            >
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="masters">Masters</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <div className="input-group">
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="Enter your qualifications.."
            />
            {errors.qualification && (
              <span className="error">{errors.qualification}</span>
            )}
          </div>
          <input type="submit" value="SUBMIT" className="submit-btn" />
          <p>
            Have an account? <Link to="/login">Login</Link>
          </p>
          <p>The password should have uppercase,lowercase and numbers</p>
        </form>
      </div>
      {loading && <Preloader />}
    </div>
  );
};

export default Signup;
