import axios from "axios";
import Config from "../../Config";
import headers from "../../headers";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import Preloader from "../../Preloader/Preloader";

const ApproveApplicant = ({
  applicant,
  handleApproveUserModal,
  getPendingApplications,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);

  const firstName = applicant?.firstName?.toUpperCase() ?? "UNKNOWN";
  const lastName = applicant?.lastName?.toUpperCase() ?? "APPLICANT";

  const approveApplicant = async () => {
    try {
      dispatch(showLoading());

      const response = await axios.put(
        `${Config.baseUrl}/api/applications/${applicant._id}/approve/application`,
        {},
        {
          headers,
        }
      );

      if (response.data.success) {
        await getPendingApplications();
        dispatch(hideLoading());
        handleApproveUserModal();
      } else {
        dispatch(hideLoading());
        console.error("Approval failed:", response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("There was a problem accessing the server:", error);
    }
  };

  return (
    <div className="modal-wrapper approve">
      <p className="medium-header">
        {`ARE SURE YOU WANT TO APPROVE "${firstName} ${lastName}"? `}
      </p>
      <div className="row-buttons" style={{ marginTop: "1rem" }}>
        <button className="modal-btn" onClick={handleApproveUserModal}>
          CANCEL
        </button>
        <button className="modal-btn" onClick={approveApplicant}>
          OK
        </button>
      </div>

      {loading && <Preloader />}
    </div>
  );
};

export default ApproveApplicant;
