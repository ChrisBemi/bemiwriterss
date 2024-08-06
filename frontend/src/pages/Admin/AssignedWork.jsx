import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./AssignedWork.css";
import axios from "axios";
import Config from "../../Config";
import { useEffect, useState } from "react";
import UpdateModal from "../../components/Admin/UpdateModal";
import DeleteWork from "../../components/Admin/DeleteWork";
import handleDownloadAllFiles from "../../utils/DownloadFiles";
import JobDescription from "../../components/Admin/JobDescription";
import formatDate from "../../utils/FormatDate";
import headers from "../../headers";
import Preloader from "../../Preloader/Preloader";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
const AssignedWork = () => {
  const [workToDelete, setWorkToDelete] = useState(null);
  const [deleteModal, showDeleteModal] = useState(false);
  const [sidebar, showSidebar] = useState(false);
  const [orders, setOrders] = useState([]);
  const [updateModal, showUpdateModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [page, setPage] = useState(1);
  const [filterText, setFilterText] = useState("");
  const [filteredOrders, setFilteredOrders] = useState("");
  const [totalJobAmount, setJobTotalAmount] = useState("");
  const [workingOrder, setWorkingOrder] = useState(null);
  const [descriptionModal, showDescriptionModal] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const handleDeleteModal = () => {
    showDeleteModal(!deleteModal);
  };

  const handleOrderToUpdate = (order) => {
    setOrderToUpdate(order);
  };

  const handleWorkToDelete = (order) => {
    setWorkToDelete(order);
  };

  const handleUpdateModal = () => {
    showUpdateModal(!updateModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const fetchWork = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/get/all/assignments?page=${page}`,
        {
          headers,
        }
      );
      dispatch(hideLoading());
      setOrders(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log("Internal server error!");
    }
  };
  const handlePrevPage = () => {
    window.scrollTo(0, 0);
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  const handleNextPage = () => {
    window.scrollTo(0, 0);
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
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

  useEffect(() => {
    fetchWork();
  }, [page]);

  useEffect(() => {
    const calculateJobTotalCharges = () => {
      if (!Array.isArray(orders)) {
        setJobTotalAmount(0);
        return;
      }

      const priceList = orders
        .filter((order) => order.completed)
        .map((order) => order.charges)
        .filter((charge) => charge != null);

      const totalAmount = priceList.reduce((a, b) => a + b, 0);

      setJobTotalAmount(totalAmount);
    };

    calculateJobTotalCharges();
  }, [orders]);

  const handleWorkingWork = (order) => {
    setWorkingOrder(order);
  };
  const handleDescriptionModal = () => {
    showDescriptionModal(!descriptionModal);
  };
  useEffect(() => {
    const filtered = orders?.filter((order) => {
      const orderIdMatch = order?.orderId
        .toLowerCase()
        .includes(filterText?.toLowerCase());
      const subjectMatch = order?.subject
        .toLowerCase()
        .includes(filterText?.toLowerCase());
      return orderIdMatch || subjectMatch;
    });
    setFilteredOrders(filtered);
  }, [filterText, orders]);
  return (
    <div className="admin assign">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="ASSIGNED WORK"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <div className="header">
          <p className="modal-header">ORDERS</p>
          <p className="modal-header">{`TOTAL COMPLETED ORDERS PRICE: ${totalJobAmount}`}</p>
        </div>
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
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>INDEX</td>
                <td>ID</td>
                <td className="date">CREATED</td>
                <td className="date">CLIENT</td>
                <td className="date">CLIENT CHARGES</td>
                <td className="date">ASSIGNED</td>
                <td className="date">SUBJECT</td>
                <td>DATELINE</td>
                <td>TIME</td>
                <td className="date">CATEGORY</td>
                <td>PAGES</td>
                <td>WORDS</td>
                <td>CHARGES</td>
                <td>PENALTY</td>
                <td>COMPLETED</td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <p>DOWNLOAD</p>
                    <p>INSTRUCTIONS</p>
                  </div>
                </td>
                <td className="description">UPDATE</td>
                <td className="description">DELETE WORK</td>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.length > 0 ? (
                filteredOrders?.map((order, index) => (
                  <tr key={order._id}>
                    <td>
                      <p className="className">{index + 1}</p>
                    </td>
                    <td>
                      <p className="description">{order.orderId}</p>
                    </td>

                    <td>
                      <p className="description">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {order?.clientName ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {order?.clientCharges ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      {order.assignedTo && (
                        <p className="description">
                          {formatDate(order.assignedAt)}
                        </p>
                      )}
                    </td>
                    <td>
                      <p className="description">{order.subject}</p>
                    </td>
                    <td>
                      <p className="description">
                        {new Date(order.dateline).toLocaleDateString()}
                      </p>
                    </td>
                    <td>
                      <p className="description">{order.time}</p>
                    </td>
                    <td>
                      <p className="description">{order.category}</p>
                    </td>
                    <td>
                      <p className="description">{order.page}</p>
                    </td>
                    <td>
                      <p className="description">{order.words}</p>
                    </td>
                    <td>
                      <p className="description">{order.charges}</p>
                    </td>
                    <td>
                      <p className="description">{order.penalty}</p>
                    </td>
                    <td>
                      <p className="description">
                        {order.completed ? "True" : "False"}
                      </p>
                    </td>
                    <td>
                      <div className="description-buttons">
                        {order.description && (
                          <button
                            className="table-btn"
                            style={{
                              fontSize: "var(--buttons-font)",
                              fontWeight: "var(--buttons-font-weight)",
                              marginTop: "1rem",
                              background: "var(--blue)",
                              border: "2px solid var(--blue)",
                            }}
                            onClick={() => {
                              handleWorkingWork(order);
                              handleDescriptionModal();
                            }}
                          >
                            Description!
                          </button>
                        )}

                        {order.files.length !== 0 && (
                          <button
                            className="table-btn"
                            onClick={() =>
                              handleDownloadAllFiles(
                                order.files,
                                order.subject,
                                "assignment"
                              )
                            }
                            style={{
                              fontSize: "var(--buttons-font)",
                              fontWeight: "var(--buttons-font-weight)",
                              background: "var(--success-color)",
                              border: "2px solid var(--success-color)",
                            }}
                          >
                            Files{" "}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          handleUpdateModal();
                          handleOrderToUpdate(order);
                        }}
                        style={{
                          fontSize: "var(--buttons-font)",
                          fontWeight: "var(--buttons-font-weight)",
                        }}
                      >
                        UPDATE
                      </button>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        style={{
                          fontSize: "var(--buttons-font)",
                          fontWeight: "var(--buttons-font-weight)",
                        }}
                        onClick={() => {
                          handleWorkToDelete(order);
                          handleDeleteModal();
                        }}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11}>
                    {" "}
                    Current there are no orders in the system{" "}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
        className={`modal delete-work-update ${deleteModal ? "active" : null}`}
      >
        <DeleteWork
          handleDeleteModal={handleDeleteModal}
          fetchWork={fetchWork}
          workToDelete={workToDelete}
        />
      </div>

      <div className={`modal update ${updateModal ? "active" : ""}`}>
        <UpdateModal
          orderToUpdate={orderToUpdate}
          handleUpdateModal={handleUpdateModal}
          fetchWork={fetchWork}
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

      {loading && <Preloader />}
    </div>
  );
};

export default AssignedWork;
