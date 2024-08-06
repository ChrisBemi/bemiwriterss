import "./CancelAssigning.css";
import axios from "axios";
import Config from "../../Config";
import { useState } from "react";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import { useDispatch, useSelector } from "react-redux";
import Preloader from "../../Preloader/Preloader";
import headers from "../../headers";

const CancelAssigning = ({
  handleCancelAssigningModal,
  cancelCredentials,
  fetchWriters,
}) => {
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);

  const handleCancel = async () => {
    setError(null);
    try {
      dispatch(showLoading());
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${cancelCredentials.assignmentId}/cancel/assigning`,
        { writerId: cancelCredentials.writerId },
        {
          headers,
        }
      );
      if (response.data.success) {
        await fetchWriters();
        handleCancelAssigningModal();
      } else {
        console.log(response.data.data);
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while canceling the assignment.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <>
      <div className="cancel modal-wrapper">
        <p className="modal-header">ARE YOU SURE YOU WANT TO CANCEL?</p>
        <div
          className="row-buttons"
          style={{
            marginTop: "0.1rem",
            width: "100%",
          }}
        >
          <button className="modal-btn" onClick={handleCancelAssigningModal}>
            CANCEL
          </button>
          <button className="modal-btn" onClick={handleCancel}>
            OK
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
      {loading && <Preloader />}
    </>
  );
};

export default CancelAssigning;
