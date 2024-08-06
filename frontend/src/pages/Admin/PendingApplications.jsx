import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./PendingApplication.css";
import { useEffect, useState } from "react";
import headers from "../../headers";
import Config from "../../Config";
import axios from "axios";
import formatDate from "../../utils/FormatDate";

import Preloader from "../../Preloader/Preloader";

import { useSelector, useDispatch } from "react-redux";

import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";

import ApproveApplicant from "../../components/Admin/ApproveApplicant";

import RejectApplicant from "../../components/Admin/RejectApplicant";

const PendingApplications = () => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.alerts.loading);

  const [sidebar, showSidebar] = useState(false);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [applicant, setApplicant] = useState([]);

  const [approveModal, showApproveModal] = useState(false);

  const [rejectApplicant, showRejectApplicant] = useState(false);

  const handleSetApplicant = (user) => {
    setApplicant(user);
  };

  const handleApproveUserModal = () => {
    showApproveModal(!approveModal);
  };

  const handleRejectApplicantModal = () => {
    showRejectApplicant(!rejectApplicant);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const getPendingApplications = async () => {
    try {
      dispatch(showLoading());

      const response = await axios.get(
        `${Config.baseUrl}/api/applications/get/pending?page=${page}`,
        {
          headers,
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        setPendingApplications(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.log(
        `There was a problem getting pending applications, => ${error.message}`
      );
    }
  };

  useEffect(() => {
    getPendingApplications();
  }, [page]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
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

  return (
    <div className="admin applications">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="PENDING APPLICATIONS"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Index</td>
                <td>Id</td>
                <td>Name</td>
                <td>Email</td>
                <td>Level</td>
                <td>Qualifications</td>
                <td>Requested On</td>
                <td>Approve</td>
                <td>Reject</td>
              </tr>
            </thead>
            <tbody>
              {pendingApplications.length > 0 ? (
                pendingApplications.map((application, index) => (
                  <tr key={application._id ?? index}>
                    <td>
                      <p className="description">{index + 1}</p>
                    </td>
                    <td>
                      <p className="description">
                        {application.systemId ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">{`${
                        application.firstName ?? ""
                      } ${application.lastName ?? ""}`}</p>
                    </td>
                    <td>
                      <p className="description">
                        {application.email ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {application.educationLevel ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {application.qualifications ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {application.createdAt
                          ? formatDate(application.createdAt)
                          : "N/A"}
                      </p>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          handleSetApplicant(application);
                          handleApproveUserModal();
                        }}
                        style={{
                          background: "var(--success-color)",
                          border: "2px solid var(--success-color)",
                        }}
                      >
                        Approve
                      </button>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          handleSetApplicant(application);
                          handleRejectApplicantModal();
                        }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No pending applications found.
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

      <div className={`modal approve ${approveModal ? "active" : ""}`}>
        <ApproveApplicant
          applicant={applicant}
          handleApproveUserModal={handleApproveUserModal}
          getPendingApplications={getPendingApplications}
        />
      </div>

      <div className={`modal disapprove ${rejectApplicant ? "active" : ""}`}>
        <RejectApplicant
          handleRejectApplicantModal={handleRejectApplicantModal}
          getPendingApplications={getPendingApplications}
          applicant={applicant}
        />
      </div>

      {loading && <Preloader />}
    </div>
  );
};

export default PendingApplications;
