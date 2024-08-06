import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./verifyEmail.css";
import Config from "../../../Config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import  { useNavigator } from "react-router-dom"
const VerifyEmail = () => {
  const location = useLocation();

  const navigate = useNavigate()
  
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const handleVerify = async () => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/profile/verify/email-profile`,
        { token, email }
      );

      console.log(response.data)

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/client/profile")
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while verifying the email.");
      console.error(error);
    }
  };

  return (
    <div className="verify-email">
      <ToastContainer />
      <div className="container">
        <div className="container-wrapper">
          <p>Confirm email change!!</p>
          <button className="submit-btn" onClick={handleVerify}>
            VERIFY
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
