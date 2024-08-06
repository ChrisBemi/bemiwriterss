import React, { useState, useRef } from "react";
import axios from "axios";
import UploadIcon from "../../../assets/icons/upload (1).png";
import Config from "../../../Config";

const UpdateOrderFiles = ({ orderToUpdate }) => {
  const headers = {
    "x-api-key": process.env.REACT_APP_API_KEY,
  };
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState("");

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleDeleteFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrors("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${orderToUpdate._id}/update/files`,
        formData,
        { headers }
      );

      if (response.data.success) {
        setMessage(response.data.message || "Files updated successfully");
        setSelectedFiles([]);
      } else {
        setErrors(response.data.message || "Failed to update files");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setErrors("Failed to update files");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="uploads">
        <p>Add more files</p>
        <img
          src={UploadIcon}
          alt="uploadIcon"
          onClick={handleUploadClick}
          style={{ cursor: "pointer" }}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          multiple
        />
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
        {errors && <p className="error">{errors}</p>}
        {message && <p className="success">{message}</p>}
        <input type="submit" value="UPDATE FILES" className="submit-btn" />
      </div>
    </form>
  );
};

export default UpdateOrderFiles;
