import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import ".././Clients.css";
import "./SubmitOrders.css";
import UploadIcon from "../../../assets/icons/upload (1).png";
import Config from "../../../Config";

import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";

import headers from "../../../headers";

import Preloader from "../../../Preloader/Preloader";

const SubmitOrders = ({ workingOrder, handleSubmitModal, fetchUserWork }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const writerId = sessionStorage.getItem("userId");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  }, []);

  const handleDeleteFile = useCallback((index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setCategoryError("");
    if (!category.trim()) {
      setCategoryError("Category is required.");
      return;
    }

    try {
      const headers = {
        "x-api-key": process.env.REACT_APP_API_KEY,
      };

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("assignmentId", workingOrder._id);
      if (description.trim()) {
        formData.append("description", description);
      }
      formData.append("category", category);
      formData.append("writerId", writerId);

      dispatch(showLoading());

      const response = await axios.post(
        `${Config.baseUrl}/api/answers/post`,
        formData,
        {
          headers, // Include headers in the request
        }
      );

      if (response.data.success) {
        setCategory("");
        setSelectedFiles([]);
        setDescription("");
        await fetchUserWork();
        dispatch(hideLoading());
        handleSubmitModal();
        alert(response.data.message);
      } else {
        dispatch(hideLoading());
        alert(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message
          : "An error occurred while submitting the order.";
    }
  };

  return (
    <>
      <div className="modal-wrapper account">
        <div className="submit-modal">
          <p
            className="modal-title"
            style={{
              color: "var(--blue)",
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            {`SUBMIT ${workingOrder?.subject.toUpperCase()}`}
          </p>
          <p
            className="modal-description"
            style={{ color: "var(--blue)", textAlign: "center" }}
          >
            Once you have submitted the work, wait for admin to approve your
            work. If it's viable, your amount in this system will be updated! If
            the work is not right, you'll be needed to revise it.
          </p>
          <div className="container">
            <form onSubmit={handleSubmit} noValidate>
              <div className="input_group">
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">SELECT CATEGORY</option>
                  <option value="draft">DRAFT</option>
                  <option value="final">FINAL</option>
                </select>
                {categoryError && <p className="error">{categoryError}</p>}
              </div>
              <div className="input_group" style={{ marginTop: "0.5rem" }}>
                <textarea
                  name="description"
                  cols="30"
                  rows="10"
                  placeholder="Write comment on the assignment kindly, if it's a revision kindly state.."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="uploads">
                <div className="input_group">
                  <img
                    src={UploadIcon}
                    className="upload-icon"
                    onClick={() => fileInputRef.current.click()}
                    style={{ cursor: "pointer" }}
                    alt="Upload Icon"
                  />
                  <p>CLICK THE BUTTON TO UPLOAD FILES</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    multiple
                  />
                </div>
                <div className="uploaded-files">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-preview">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        className="table-btn"
                        onClick={() => handleDeleteFile(index)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

             
              </div>
              <div className="row-buttons" style={{ marginTop: "2rem" }}>
                <button
                  type="button"
                  className="modal-btn"
                  onClick={handleSubmitModal}
                >
                  CANCEL
                </button>
                <button type="submit" className="modal-btn">
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {loading && <Preloader />}
    </>
  );
};

export default SubmitOrders;
