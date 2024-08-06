import React, { useState, useCallback } from "react";
import "./RequestRevisionModal.css";
import UploadIcon from "../../assets/icons/upload.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Config from "../../Config";
import Preloader from "../../Preloader/Preloader";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import headers from "../../headers";

const RequestRevisionModal = React.memo(
  ({ handleInRevisionModal, workingOrder, fetchData }) => {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.alerts.loading);
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState("");

    // useCallback to memoize handleFileChange function
    const handleFileChange = useCallback((event) => {
      const selectedFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }, []);

    // useCallback to memoize handleDeleteFile function
    const handleDeleteFile = useCallback((index) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }, []);

    const setInRevision = async () => {
      try {
        dispatch(showLoading());

        const formData = new FormData();
        formData.append("comment", comment);
        formData.append("email", workingOrder.email);
        formData.append("orderId", workingOrder.orderId);
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await axios.put(
          `${Config.baseUrl}/api/answers/${workingOrder.answerId}/update/revision`,
          formData,
          {
            headers
          }
        );

        dispatch(hideLoading());

        if (!response.data.success) {
          toast.error(response.data.message);
        } else {
         
          fetchData();
          handleInRevisionModal();
          // Clear the form data
          setComment("");
          setFiles([]);
          toast.success(response.data.message);
        }
      } catch (error) {
        dispatch(hideLoading());
        toast.error("There was an error updating the revision status.");
        console.error(`Error: ${error.message}`);
      }
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      if (!comment) {
        toast.error("Comment is required");
        return;
      }
      setInRevision();
    };

    return (
      <>
        <form className="revision modal-wrapper" onSubmit={handleSubmit}>
          <p className="modal-header">{`REQUEST REVISION ON ${workingOrder?.subject?.toUpperCase()}`}</p>
          <div className="input_group">
            <textarea
              name="comment"
              placeholder="What should the writer consider?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="upload-container">
            <input
              type="file"
              id="file-input"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <img
              src={UploadIcon}
              alt="Upload"
              className="upload-icon"
              onClick={() => document.getElementById("file-input").click()}
            />
          </div>

          <div className="uploaded-files" style={{ margin: "1.5rem 0rem" }}>
            {files.map((file, index) => (
              <div key={index} className="file-preview">
                <span>{file.name}</span>
                <button
                  type="button"
                  className="table-btn"
                  onClick={() => handleDeleteFile(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="row-buttons">
            <button
              type="button"
              className="modal-btn"
              onClick={handleInRevisionModal}
            >
              CANCEL
            </button>
            <button type="submit" className="modal-btn">
              OK
            </button>
          </div>
        </form>

        {loading && <Preloader />}
      </>
    );
  }
);

export default RequestRevisionModal;
