import React, { useState } from "react";
import axios from "axios";
import Config from "../../../Config";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import headers from "../../../headers";

const UpdateName = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!firstName.trim() && !lastName.trim()) {
      setError("Please fill at least one of the fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/profile/${sessionStorage.getItem(
          "userId"
        )}/update/name`,
        {
          firstName,
          lastName,
        },
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
      setError(
        error.response?.data?.message ||
          "An error occurred while updating the name."
      );
    }
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <div className="card">
      <p className="large-headers">UPDATE NAME</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="Firstname..."
            value={firstName}
            onChange={handleFirstNameChange}
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Lastname..."
            value={lastName}
            onChange={handleLastNameChange}
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

export default UpdateName;
