import headers from "../../headers";
import Config from "../../Config";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import Preloader from "../../Preloader/Preloader";

const RejectApplicant = ({
  handleRejectApplicantModal,
  getPendingApplications,
  applicant,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const firstName = applicant?.firstName?.toUpperCase() ?? "UNKNOWN";
  const lastName = applicant?.lastName?.toUpperCase() ?? "APPLICANT";

  const rejectApplication = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.put(
        `${Config.baseUrl}/api/applications/${applicant._id}/reject/application`,
        {},
        {
          headers,
        }
      );

      if (response.data.success) {
        await getPendingApplications();
        handleRejectApplicantModal();
      } else {
        console.error("Rejection failed:", response.data.message);
      }
    } catch (error) {
      console.error("There was a problem accessing the server:", error);
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="modal-wrapper disapprove">
      <p className="medium-header">
        {`ARE SURE YOU WANT TO REJECT "${firstName} ${lastName}" APPLICATION? `}
      </p>
      <div className="row-buttons" style={{ marginTop: "1rem" }}>
        <button className="modal-btn" onClick={handleRejectApplicantModal}>
          CANCEL
        </button>
        <button className="modal-btn" onClick={rejectApplication}>
          OK
        </button>
      </div>

      {loading && <Preloader />}
    </div>
  );
};

export default RejectApplicant;
