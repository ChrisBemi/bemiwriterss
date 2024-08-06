import React, { useState, useEffect } from "react";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import axios from "axios";
import handleDownloadAllFiles from "../../../utils/DownloadFiles";
import formatDate from "../../../utils/FormatDate";
import JobDescription from "../../../components/Admin/JobDescription";
import "./InReview.css";
import calculateRemainingTime from "../../../utils/CalculateRemainingTime";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const InReview = () => {
  const [sidebar, showSidebar] = useState(false);
  const [inReviews, setInReviews] = useState([]);
  const [workingOrder, setWorkingOrder] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [penaltyCount, setPenalty] = useState("");
  const [isTimeExpired, setTimeExpired] = useState(false);
  const [descriptionModal, showDescriptionModal] = useState(false);

  const handleWorkingWork = (order) => {
    setWorkingOrder(order);
  };
  const handleDescriptionModal = () => {
    showDescriptionModal(!descriptionModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };
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

      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${assignmentId}/update/penalty`,
        { penalty: penaltyAmount }
      );

      if (response.data.success) {
        fetchAssignmentsInReview();
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
        const updatedCountdowns = inReviews?.reduce((acc, order) => {
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
  }, [inReviews]);

  useEffect(() => {
    const interval = setInterval(() => {
      inReviews.forEach((order) => {
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
  }, [inReviews]);
  const fetchAssignmentsInReview = async () => {
    try {
      const response = await axios.get(
        `${
          Config.baseUrl
        }/api/writers/assignments/inReview/${sessionStorage.getItem("userId")}`
      );
      setInReviews(response.data.data);
    } catch (error) {
      console.log(
        `There was an error accessing the data from the backend`,
        error
      );
    }
  };

  useEffect(() => {
    fetchAssignmentsInReview();
  }, []);

  return (
    <div className="account inreview withdrawal">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="IN REVIEW"
      />
      <AccountSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Page</td>
                <td>Words</td>
                <td>Subject</td>
                <td>Dateline</td>

                <td>CompletedAt</td>
                <td>Category</td>
                <td>Charges(SH)</td>
                <td>DueTime</td>
                <td>Penalty(SH)</td>
                <td>
                  <p>Download</p>
                  <p>Instructions</p>
                </td>
              </tr>
            </thead>
            <tbody>
              {inReviews?.map((review) => (
                <tr key={review._id}>
                  <td>
                    <p className="description">{review.page}</p>
                  </td>
                  <td>
                    <p className="description">{review.words}</p>
                  </td>
                  <td>
                    <p className="description">{review.subject}</p>
                  </td>
                  <td>
                    <p className="description">
                      {new Date(review.dateline).toLocaleDateString()}
                    </p>
                  </td>
                  <td>
                    <p>{review.completedAt}</p>
                  </td>
                  <td>
                    <p className="description">{review.category}</p>
                  </td>
                  <td>
                    <p className="description">{review.charges}</p>
                  </td>
                  <td className="due-time">
                    <div className="time-container">
                      <p
                        className="description"
                        style={{ color: "var(--blue)" }}
                      >
                        Deadline:
                        <br />
                        {review.dateline.split("T")[0]} at {review.time}
                      </p>

                      {countdowns[review._id]?.timeString}
                    </div>
                  </td>
                  <td className="penalties">
                    <p
                      className="description"
                      style={{ color: "var(--pinkRed" }}
                    >
                      {countdowns[review._id]?.penalty
                        ? `${countdowns[review._id]?.penalty}`
                        : `${review.penalty}`}
                    </p>
                  </td>
                  <td>
                    <div className="description-buttons">
                      {review?.description && (
                        <button
                          className="table-btn"
                          onClick={() => {
                            handleWorkingWork({
                              subject: review.subject,
                              description: review.description,
                            });
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

                      {review.files.length !== 0 ? (
                        <button
                          className="table-btn"
                          onClick={() => {
                            handleDownloadAllFiles(
                              review.files,
                              review.subject,
                              "assignment"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`modal job ${descriptionModal ? "active" : null}`}>
          <JobDescription
            workingOrder={workingOrder}
            handleDescriptionModal={handleDescriptionModal}
          />
        </div>
      </div>
    </div>
  );
};

export default InReview;
