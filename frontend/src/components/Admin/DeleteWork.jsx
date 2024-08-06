import Config from "../../Config";
import "./DeleteModal.css";
import axios from "axios";

import { useSelector, useDispatch } from "react-redux";

import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";

import Preloader from "../../Preloader/Preloader";

import headers from "../../headers";

const DeleteWork = ({ handleDeleteModal, workToDelete, fetchWork }) => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.alerts.loading);

  const deleteWork = async () => {
    try {
      dispatch(showLoading());

      const response = await axios.delete(
        `${Config.baseUrl}/api/assignments/delete/${workToDelete._id}`,
        {
          headers,
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        console.log(`The assignment successfully deleted`);
        await fetchWork();
        handleDeleteModal();
      }
    } catch (error) {
      console.log(`There was an error accessing the server ${error.message}`);
    }
  };

  return (
    <>
      <div className="delete-work modal-wrapper">
        <p className="medium-header">{`Are you sure you want to delete ${workToDelete?.subject}?`}</p>
        <div className="row-buttons">
          <button className="modal-btn" onClick={handleDeleteModal}>
            CANCEL
          </button>
          <button className="modal-btn" onClick={deleteWork}>
            OK
          </button>
        </div>
      </div>

      {loading && <Preloader />}
    </>
  );
};

export default DeleteWork;
