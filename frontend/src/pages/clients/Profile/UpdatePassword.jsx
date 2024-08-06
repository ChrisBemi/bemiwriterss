import React, { useState } from "react";
import axios from "axios";
import Config from "../../../Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import headers from "../../../headers";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/profile/update-password/${sessionStorage.getItem(
          "userId"
        )}`,
        { password },
        {
          headers,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setError("An error occurred while updating the password");
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError(null);
    setMessage(null);
  };

  return (
    <div className="card">
      <ToastContainer />
      <p className="large-headers">PASSWORD UPDATE</p>
      <form onSubmit={handleUpdatePassword}>
        <div className="input-group">
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            placeholder="Password..."
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword)}
            placeholder="Confirm password..."
            required
          />
          {error && <p className="error">{error}</p>}
        </div>
        <input
          type="submit"
          value="UPDATE"
          className="submit-btn"
          style={{ marginTop: "1rem" }}
        />
      </form>
    </div>
  );
};

export default UpdatePassword;
