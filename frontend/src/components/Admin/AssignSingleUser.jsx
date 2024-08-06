import React, { useState } from "react";
import "./assignSingleUser.css";
import CloseIcon from "../../assets/icons/close.png";
import Config from "../../Config";
import axios from "axios";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";

import { useDispatch, useSelector } from "react-redux";

import headers from "../../headers";

import Preloader from "../../Preloader/Preloader";

const AssignSingleUser = ({
  handleSingleUserAssignment,
  workJob,
  fetchWriters,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const assignSingleUserJob = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      dispatch(showLoading());

      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${workJob.orderId}/manual/assigning`,
        { email },
        {
          headers,
        }
      );

      if (!response.data.success) {
        dispatch(hideLoading());
        setError(response.data.message);
      } else {
        await fetchWriters();
        dispatch(hideLoading());
        handleSingleUserAssignment();
      }
    } catch (error) {
      console.log("There was an error accessing the server!!");
    }
  };

  return (
    <div className="modal-wrapper assign-single">
      <img
        src={CloseIcon}
        alt="Close"
        className="close-icon"
        onClick={handleSingleUserAssignment}
      />
      <p className="modal-header">
        {`ASSIGN ${
          workJob && workJob.subject ? workJob.subject.toUpperCase() : ""
        } WRITER`}
      </p>
      <div className="input-group">
        <input
          type="email"
          name="email"
          placeholder="Enter the email of the writer..."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
        {error && <p className="error">{error}</p>}
      </div>

      <div
        className="row-buttons"
        style={{
          marginTop: "0.1rem",
          width: "100%",
        }}
      >
        <button className="modal-btn" onClick={handleSingleUserAssignment}>
          CANCEL
        </button>
        <button className="modal-btn" onClick={assignSingleUserJob}>
          OK
        </button>
      </div>
      {loading && <Preloader />}
    </div>
  );
};

export default AssignSingleUser;
