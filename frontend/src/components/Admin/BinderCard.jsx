import ProfileImage from "../../assets/icons/user.png";
import Config from "../../Config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headers from "../../headers";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import Preloader from "../../Preloader/Preloader";
import { useDispatch, useSelector } from "react-redux";
const BinderCard = ({
  writer,
  orderId,
  fetchWriters,
  handleAssigningModal,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const assignWriter = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/assign/${orderId}`,
        {
          writerId: writer._id,
        },
        {
          headers,
        }
      );
      dispatch(hideLoading());
      if (!response.data.success) {
        toast.error(response.data.message);
      }
      await fetchWriters();
      toast.success(response.data.message);
      handleAssigningModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="profile-cards">
      <ToastContainer />
      <div className="img-wrapper">
        <img
          src={writer.profile?.downloadURL || ProfileImage}
          alt={`${writer.firstName} ${writer.lastName}`}
        />
      </div>
      <p>{`${writer.firstName} ${writer.lastName}`}</p>
      <p>{`${writer.educationLevel}`}</p>
      <p>{`${writer.qualifications}`}</p>
      <button className="table-btn" onClick={assignWriter}>
        ASSIGN
      </button>

      {loading && <Preloader />}
    </div>
  );
};

export default BinderCard;
