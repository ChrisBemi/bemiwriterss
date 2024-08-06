import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./Admin.css";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import "./write.css";
import ViewBindersModal from "../../components/Admin/ViewBindersModal";
import AssignSingleUser from "../../components/Admin/AssignSingleUser";
import CancelAssigning from "../../components/Admin/CancelAssigning";
import formatDate from "../../utils/FormatDate";
import headers from "../../headers";
const AssignedOrders = () => {
  const [deleteModal, showDeleteModal] = useState(false);
  const [work, setWork] = useState([]);
  const [sidebar, showSidebar] = useState(false);
  const [academicWriters, setWritersToAssign] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assigningModal, showAssigningModal] = useState(false);
  const [workJob, setWriter] = useState([]);
  const [cancelAssignment, setCancelAssignment] = useState(false);
  const [cancelCredentials, setCancelCredentials] = useState(null);
  const [singleAssigningUser, setSingleAssigningUser] = useState(false);

  const handleAssigningCredentials = (credentials) => {
    setCancelCredentials(credentials);
  };

  const handleCancelAssigningModal = () => {
    setCancelAssignment(!cancelAssignment);
  };

  const handleSingleUserAssignment = () => {
    setSingleAssigningUser(!singleAssigningUser);
  };

  const handleWriterToWorkWith = (academicWriter) => {
    setWriter(academicWriter);
  };

  const handleAssigningModal = () => {
    showAssigningModal(!assigningModal);
  };

  const handleWritersToWorkWith = (academicWriters) => {
    setWritersToAssign(academicWriters);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchWriters = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/get?page=${page}&limit=15`,
        {
          headers,
        }
      );

      if (response.data.success) {
        setWork(response.data.data);

        setTotalPages(response.data.totalPages);
      } else {
        console.log("There was a network problem fetching data");
      }
    } catch (error) {
      console.log("There was a problem accessing the server");
    }
  };

  useEffect(() => {
    fetchWriters();
  }, [page]);

  const handleDeleteModal = () => {
    showDeleteModal(!deleteModal);
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handlePrevPage = () => {
    window.scrollTo(0, 0);
    setPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    window.scrollTo(0, 0);
    setPage((prevPage) => prevPage + 1);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      const buttonClass =
        i === page ? "navigation-btns current-page" : "navigation-btns";
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={buttonClass}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };
  return (
    <div className="admin work">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="ASSIGNED ORDERS"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        {work.length > 0 && (
          <div className="table_wrapper">
            <table>
              <thead>
                <tr>
                  <td>Index</td>
                  <td>OrderId</td>
                  <td>Subject</td>
                  <td>Uploaded at</td>
                  <td>Assigned At</td>
                  <td>Dateline</td>
                  <td>Time</td>
                  <td>Category</td>
                  <td>Pages</td>
                  <td>Words</td>
                  <td>Bid</td>
                  <td>Charges</td>
                  <td>Cancel Bidder</td>
                </tr>
              </thead>
              <tbody>
                {work?.map((order, index) =>
                  order.bid !== 0 && order.assigned ? (
                    <tr key={order._id}>
                      <td>
                        <p className="description">{index + 1}</p>
                      </td>
                      <td>
                        <p className="description">{order.orderId}</p>
                      </td>
                      <td>
                        <p className="description">{order?.subject}</p>
                      </td>
                      <td>
                        {order.createdAt && (
                          <p className="description">
                            {formatDate(order.createdAt)}
                          </p>
                        )}
                      </td>
                      <td>
                        {order.assignedAt && (
                          <p className="description">
                            {formatDate(order.assignedAt)}
                          </p>
                        )}
                      </td>
                      <td>
                        <p className="description">
                          {new Date(order.dateline).toLocaleDateString()}
                        </p>
                      </td>
                      <td>
                        <p className="description">{order?.time}</p>
                      </td>
                      <td>
                        <p className="description">{order?.category}</p>
                      </td>
                      <td>
                        <p className="description">{order?.page}</p>
                      </td>
                      <td>
                        <p className="description">{order?.words}</p>
                      </td>
                      <td>
                        <p className="description">{`Bids: ${order.bid}`}</p>
                        {order.bid !== 0 && order.assigned ? (
                          <p
                            className="description"
                            style={{ color: "var(--success-color)" }}
                          >
                            Already Assigned
                          </p>
                        ) : null}

                        {order.bid !== 0 && !order.assigned ? (
                          <button
                            className="table-btn"
                            onClick={() => {
                              handleWritersToWorkWith([
                                ...order.writers,
                                { assignmentId: order._id },
                              ]);
                              handleAssigningModal();
                            }}
                          >
                            View
                          </button>
                        ) : null}
                      </td>

                      <td>
                        <p className="description">{order?.charges}</p>
                      </td>
                      <td>
                        {(order.inReview ||
                          order.completed ||
                          order.inRevision) && (
                          <p
                            className="description"
                            style={{ color: "var(--success-color)" }}
                          >
                            Work was submitted
                          </p>
                        )}

                        {order.bid > 0 &&
                        order?.assignedTo?.length > 0 &&
                        !order.inReview &&
                        !order.completed &&
                        !order.inRevision ? (
                          <button
                            className="table-btn"
                            onClick={() => {
                              handleAssigningCredentials({
                                assignmentId: order._id,
                                writerId: order.assignedTo, // Assuming only one writer is assigned
                              });
                              handleCancelAssigningModal();
                            }}
                          >
                            Cancel
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination" style={{ marginTop: "10px" }}>
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="navigation-btns"
          >
            Prev
          </button>
          {renderPageNumbers()}
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="navigation-btns"
          >
            Next
          </button>
        </div>
      </div>

      <div
        className={`modal assign-user ${singleAssigningUser ? "active" : null}`}
      >
        <AssignSingleUser
          handleSingleUserAssignment={handleSingleUserAssignment}
          workJob={workJob}
          fetchWriters={fetchWriters}
        />
      </div>
      <div className={`modal view-binders ${assigningModal ? "active" : null}`}>
        <ViewBindersModal
          handleAssigningModal={handleAssigningModal}
          academicWriters={academicWriters}
          fetchWriters={fetchWriters}
        />
      </div>

      <div
        className={`modal cancel-assigning ${
          cancelAssignment ? "active" : null
        }`}
      >
        <CancelAssigning
          cancelCredentials={cancelCredentials}
          handleCancelAssigningModal={handleCancelAssigningModal}
          fetchWriters={fetchWriters}
        />
      </div>
    </div>
  );
};

export default AssignedOrders;
