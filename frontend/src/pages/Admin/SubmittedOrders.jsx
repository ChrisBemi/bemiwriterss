import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import Config from "../../Config";
import axios from "axios";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./submittedOrders.css";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import { useSelector, useDispatch } from "react-redux";
import Preloader from "../../Preloader/Preloader";
import RequestRevisionModal from "../../components/Admin/RequestRevisionModal";
import JSZip from "jszip";
import JobDescription from "../../components/Admin/JobDescription";
import "./SubmittedOrders.css";
import handleDownloadAllFiles from "../../utils/DownloadFiles";
import formatDate from "../../utils/FormatDate";
import headers from "../../headers";
const SubmittedOrders = () => {
  const loading = useSelector((state) => state.alerts.loading);
  const dispatch = useDispatch();
  const [sidebar, showSidebar] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [workingOrder, setWorkingOrder] = useState([]);

  const [jobDescription, showJobDescription] = useState(false);

  const handleDescriptionModal = () => {
    showJobDescription(!jobDescription);
  };

  const [requestRevisionModal, setInRequestRevisionModal] = useState(false);

  const cancelInRevision = async (answerId, orderId) => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/answers/${answerId}/${orderId}/cancel/revision`,
        {
          headers,
        }
      );

      console.log(response.data);
      if (!response.data.success) {
        toast.error(response.data.message);
      } else {
        toast.success(response.data.message);
        fetchData();
      }
    } catch (error) {
      toast.error("There was an error updating the revision status.");
      console.error(`There was an error: ${error}`);
    }
  };

  const deleteAnswer = async (answerId) => {
    try {
      dispatch(showLoading());
      const response = await axios.delete(
        `${Config.baseUrl}/api/answers/${answerId}/delete/answer`,
        {
          headers,
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("There was an error deleting the answer.");
      console.error(`There was an error: ${error}`);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${Config.baseUrl}/api/answers/get`, {
        headers,
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error(`There was an error: ${error}`);
    }
  };

  const completeOrderButton = async (assignmentId, userId, amount) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/writers/complete/assignment/${userId}`,
        { assignmentId, amount },
        { headers }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while completing the order.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };
  const handleInRevisionModal = () => {
    setInRequestRevisionModal(!requestRevisionModal);
  };

  const handleWorkingOrder = (order) => {
    setWorkingOrder(order);
  };

  return (
    <div className="admin submitted">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="SUBMITTED ORDERS"
      />
      <AdminSidebar sidebar={sidebar} />
      <div className="container">
        <p className="empty"></p>

        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Order</td>
                <td>Writer</td>
                <td>Subject</td>
                <td>Created At</td>
                <td>Submitted At</td>
                <td>State</td>
                <td>Charges</td>
                <td>Penalties</td>
                <td>View</td>
                <td>Revision/Cancel</td>
                <td>Completed?</td>
                <td>Completed At</td>
                <td>Delete</td>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <p className="description">
                      There are no submitted orders!
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <p className="description">
                        {order?.assignmentId
                          ? order?.assignmentId?.orderId
                          : "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {" "}
                        {order?.writerId
                          ? `${order?.writerId?.firstName} ${order?.writerId?.lastName}`
                          : "N/A"}
                      </p>
                    </td>

                    <td style={{ maxWidth: "250px" }}>
                      <p className="description">
                        {order?.assignmentId?.subject || "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {formatDate(order?.createdAt)}
                      </p>
                    </td>
                    <td>
                      {order.submittedAt && (
                        <p className="description">
                          {formatDate(order?.submittedAt)}
                        </p>
                      )}
                    </td>
                    <td>
                      <p className="description">{order?.category || "N/A"}</p>
                    </td>
                    <td>
                      <p className="description">
                        {order?.assignmentId?.charges || "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {order?.assignmentId?.penalty || "N/A"}
                      </p>
                    </td>
                    <td>
                      {order?.files?.length !== 0 && (
                        <button
                          className="table-btn"
                          onClick={() =>
                            handleDownloadAllFiles(
                              order?.files,
                              order?.assignmentId?.subject,
                              "answers"
                            )
                          }
                        >
                          Files
                        </button>
                      )}
                      {order?.description && (
                        <button
                          className="table-btn"
                          style={{
                            marginTop: "1rem",
                            background: "var(--blue)",
                            border: "2px solid var(--white)",
                          }}
                          onClick={() => {
                            handleDescriptionModal();
                            handleWorkingOrder({
                              subject: order?.assignmentId?.subject,
                              description: order?.description,
                            });
                          }}
                        >
                          Description
                        </button>
                      )}
                    </td>
                    <td>
                      {order?.inRevision ? (
                        <button
                          className="table-btn"
                          onClick={() =>
                            cancelInRevision(
                              order?._id,
                              order?.assignmentId?._id
                            )
                          }
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          className="table-btn setInRevision"
                          onClick={() => {
                            handleWorkingOrder({
                              answerId: order?._id,
                              email: order?.writerId?.email || "",
                              orderId: order?.assignmentId?._id || "",
                              subject: order?.assignmentId?.subject || "",
                            });
                            handleInRevisionModal();
                          }}
                          style={{ border: "2px solid var(--success-color)" }}
                        >
                          Revision
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        disabled={order?.assignmentId?.completed}
                        style={
                          order?.assignmentId?.completed
                            ? {
                                background: "var(--success-color)",
                                border: "2px solid var(--success-color)",
                              }
                            : null
                        }
                        onClick={() =>
                          completeOrderButton(
                            order?.assignmentId?._id || "",
                            order?.writerId?._id || "",
                            parseFloat(order?.assignmentId?.charges) || 0
                          )
                        }
                      >
                        {order?.assignmentId?.completed
                          ? "COMPLETED"
                          : "CONFIRM"}
                      </button>
                    </td>
                    <td>
                      {order?.assignmentId?.completed && (
                        <p className="description">
                          {formatDate(order?.assignmentId?.completedAt)}
                        </p>
                      )}
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => deleteAnswer(order?._id)}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`modal request-revision ${
            requestRevisionModal ? "active" : null
          }`}
        >
          <RequestRevisionModal
            handleInRevisionModal={handleInRevisionModal}
            workingOrder={workingOrder}
            fetchData={fetchData}
          />
        </div>

        <div
          className={`modal description-modal ${
            jobDescription ? "active" : null
          }`}
        >
          <JobDescription
            handleDescriptionModal={handleDescriptionModal}
            workingOrder={workingOrder}
          />
        </div>
      </div>

      {loading && <Preloader />}
    </div>
  );
};

export default SubmittedOrders;
