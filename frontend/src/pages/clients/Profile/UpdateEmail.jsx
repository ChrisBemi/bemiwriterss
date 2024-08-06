import React, { useState } from "react";
import Config from "../../../Config";
import axios from "axios";

import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";

import { useDispatch, useSelector } from "react-redux";

import Preloader from "../../../Preloader/Preloader";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import headers from "../../../headers";

const UpdateEmail = () => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.alerts.loading);

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const update__email = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    try {
      dispatch(showLoading());

      const response = await axios.post(
        `${Config.baseUrl}/api/profile/${sessionStorage.getItem(
          "userId"
        )}/update/email-profile`,
        { email },
        {
          headers,
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setError("An error occurred while updating the email.");
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(null);
    setMessage(null);
  };

  return (
    <div className="card">
      <p className="large-headers">EMAIL UPDATE</p>
      <form onSubmit={update__email}>
        <ToastContainer />
        <div className="input-group">
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Email..."
            required
          />
          {error && <p className="error">{error}</p>}
          {message && (
            <p className="error" style={{ color: "var(--success-color)" }}>
              {message}
            </p>
          )}
        </div>
        <input
          type="submit"
          style={{ marginTop: "1rem" }}
          value="UPDATE"
          className="submit-btn"
        />
      </form>

      {loading && <Preloader />}
    </div>
  );
};

export default UpdateEmail;
