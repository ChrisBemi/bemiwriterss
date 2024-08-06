import React, { useState } from "react";
import UploadIcon from "../../../assets/icons/upload (1).png";
import User from "../../../assets/icons/user.png";
import axios from "axios";
import Config from "../../../Config";

import useUser from "../../../userUser";
// Ensure correct path
import "./UpdateProfileImage.css";

import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";

import Preloader from "../../../Preloader/Preloader";

import headers from "../../../headers";

import { useDispatch, useSelector } from "react-redux";

const UpdateProfileImage = () => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.alerts.loading);

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const user = useUser();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError("");
    } else {
      setSelectedFile(null);
      setError("Please select a valid image file.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${Config.baseUrl}/api/profile/${user?._id}/update/profile-image`, // Use user ID from context
        formData,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        setSuccessMessage("Profile image updated successfully!");
        setError("");
      } else {
        setError(response.data.message || "Failed to update profile image.");
      }
    } catch (error) {
      setError("An error occurred while uploading the image.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="update-profile-image">
      <div className="image-wrapper">
        <img
          src={
            selectedFile
              ? URL.createObjectURL(selectedFile)
              : user?.profileUrl || User
          }
          alt="User"
        />

        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
      <div className="upload">
        <label htmlFor="fileInput" className="upload-btn">
          <img src={UploadIcon} alt="Upload Icon" className="uploadIcon" />
        </label>
        <input type="submit" value="SAVE" className="submit-btn" />
      </div>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {loading && <Preloader />}
    </form>
  );
};

export default UpdateProfileImage;
