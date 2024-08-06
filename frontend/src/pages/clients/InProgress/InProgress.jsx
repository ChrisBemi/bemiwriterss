import React, { useEffect, useState } from "react";
import axios from "axios";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import ".././Clients.css";
import "./InProgress.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubmitOrders from "../SubmitOrders/SubmitOrders";
import JobDescription from "../../../components/Admin/JobDescription";
import useUser from "../../../userUser";
import formatDate from "../../../utils/FormatDate";
import handleDownloadAllFiles from "../../../utils/DownloadFiles";
import headers from "../../../headers";
import calculateRemainingTime from "../../../utils/CalculateRemainingTime";
const InProgress = () => {
  const user = useUser();
  const [orders, setOrders] = useState([]);
  const [sidebar, showSidebar] = useState(false);

  // COUNTDOWNS
  const [countdowns, setCountdowns] = useState({});
  const [penaltyCount, setPenalty] = useState("");
  const [isTimeExpired, setTimeExpired] = useState(false);
  //COUNTDOWNS

  const [loading, setLoading] = useState(true);
  const [workingOrder, setWorkingOrder] = useState(null);
  const [submitModal, displaySubmitModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [descriptionModal, showDescriptionModal] = useState(false);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchUserWork = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/writers/assignments/${userId}`,
        {
          headers,
        }
      );

      setOrders(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error(`Error accessing data from the backend: ${error.message}`);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("userId")) {
      fetchUserWork();
    }
  }, []);

  const updatePenalty = async (
    assignmentId,
    delayMinutes,
    charges,
    penalty
  ) => {
    try {
      const penaltyAmount = delayMinutes * 5;

      if (penalty > charges) {
        return;
      }

      console.log(penaltyAmount);

      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${assignmentId}/update/penalty`,
        { penalties: penaltyAmount },
        {
          headers,
        }
      );

      if (response.data.success) {
        fetchUserWork();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("An error occurred while updating penalty");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prevCountdowns) => {
        const updatedCountdowns = orders.reduce((acc, order) => {
          const { timeString, overdue, minutes } = calculateRemainingTime(
            order.dateline,
            order.time,
            order._id,
            order.charges,
            order.penalty
          );

          acc[order._id] = {
            timeString,
            overdue,
            minutes,
            penalty: order.penalty,
          };

          return acc;
        }, {});
        return updatedCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach((order) => {
        const { overdue, minutes } = calculateRemainingTime(
          order.dateline,
          order.time,
          order._id
        );

        if (overdue && !order.penaltyUpdated) {
          updatePenalty(order._id, minutes, order.charges, order.penalty);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [orders]);
  const handleWorkingWork = (order) => {
    setWorkingOrder(order);
  };

  const handleSubmitModal = () => {
    displaySubmitModal(!submitModal);
  };

  useEffect(() => {
    const filtered = orders?.filter((order) => {
      const orderIdMatch = order?._id
        .toLowerCase()
        .includes(filterText?.toLowerCase());
      const subjectMatch = order?.subject
        .toLowerCase()
        .includes(filterText?.toLowerCase());
      return orderIdMatch || subjectMatch;
    });
    setFilteredOrders(filtered);
  }, [filterText, orders]);

  const handleDescriptionModal = () => {
    showDescriptionModal(!descriptionModal);
  };

  return (
    <div className="progress account">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="IN PROGRESS"
      />
      <p className="empty"></p>
      <AccountSidebar sidebar={sidebar} />
      <div className="container">
        <p>
          Once you've submitted the work and if it coincides with the client's
          specifications, it will be completed. If there is any penalty it will
          be deducted from the cost of the work!
          <br />
          If the work is not up to standards the client will require you to
          carry out revision! Meanwhile, total charges - any penalties will be
          your compensation after the client has presided over the work with the
          utmost degree of satisfaction!
        </p>
        <div className="search_container">
          <div className="input-group">
            <input
              type="text"
              name="search"
              id=""
              placeholder="Filter by orderId or subject"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <button>
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <ToastContainer />
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Order Id</td>
                <td>Paper Details</td>
                <td>Pages</td>
                <td>Words</td>
                <td>Charges(SH)</td>
                <td>Time Assigned</td>
                <td className="due-time">Due Date</td>
                <td className="penalties">Penalty(SH)</td>
                <td>
                  <p>Download</p>
                  <p>Instructions</p>
                </td>
                <td>Submit order</td>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.length > 0 ? (
                filteredOrders.map((order, index) =>
                  order.assigned && !order.completed && !order.inReview ? (
                    <tr key={order._id}>
                      <td>
                        {order.orderId ? (
                          <p className="description">
                            Order Id: {order.orderId}
                          </p>
                        ) : (
                          <p className="description">Order Id: {order._id}</p>
                        )}
                      </td>
                      <td>
                        <p
                          className="description"
                          style={{ fontWeight: "600" }}
                        >{`Title: ${order.subject}`}</p>
                        <p
                          className="description"
                          style={{ color: "var(--blue)", fontWeight: "600" }}
                        >{`Category: ${order.category}`}</p>
                      </td>
                      <td>
                        <p className="description">{order?.page}</p>
                      </td>
                      <td>
                        <p className="description">{order?.words}</p>
                      </td>
                      <td>
                        <p className="description">{order?.charges}</p>
                      </td>
                      <td>
                        <p className="description">
                          {formatDate(order.assignedAt)}
                        </p>
                      </td>
                      <td className="due-time">
                        <div className="time-container">
                          <p
                            className="description"
                            style={{ color: "var(--blue)" }}
                          >
                            Deadline:
                            <br />
                            {order.dateline.split("T")[0]} at {order.time}
                          </p>

                          {countdowns[order._id]?.timeString}
                        </div>
                      </td>

                      <td className="penalties">
                        <p
                          className="description"
                          style={{ color: "var(--pinkRed" }}
                        >
                          {countdowns[order._id]?.penalty
                            ? `${countdowns[order._id]?.penalty}`
                            : `${order.penalty}`}
                        </p>
                      </td>
                      <td>
                        <div className="description-buttons">
                          {order?.description && (
                            <button
                              className="table-btn"
                              onClick={() => {
                                handleWorkingWork(order);
                                handleDescriptionModal();
                              }}
                              style={{
                                background: "var(--blue)",
                                border: "2px solid var(--blue)",
                              }}
                            >
                              Description
                            </button>
                          )}

                          {order.files.length !== 0 ? (
                            <button
                              className="table-btn"
                              onClick={() => {
                                handleDownloadAllFiles(
                                  order.files,
                                  order.subject,
                                  "assignments"
                                );
                              }}
                            >
                              Get files
                            </button>
                          ) : (
                            <></>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="table-btn"
                          style={{
                            background: "var(--success-color)",
                            border: "2px solid var(--success-color)",
                          }}
                          onClick={() => {
                            handleWorkingWork(order);
                            handleSubmitModal();
                          }}
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ) : null
                )
              ) : (
                <tr>
                  <td colSpan="6">
                    <p>There is no order in progress!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`submit-orders account modal ${
            submitModal ? "active" : null
          } `}
        >
          <SubmitOrders
            workingOrder={workingOrder}
            handleSubmitModal={handleSubmitModal}
            fetchUserWork={fetchUserWork}
          />
        </div>
        <div
          className={`modal see-work-description ${
            descriptionModal ? "active" : null
          }`}
        >
          <JobDescription
            workingOrder={workingOrder}
            handleDescriptionModal={handleDescriptionModal}
          />
        </div>
      </div>
    </div>
  );
};

export default InProgress;
