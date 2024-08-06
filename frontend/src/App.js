import Home from "./pages/common/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AcademicBlog from "./pages/common/Academicblogs/AcademicBlog";
import AcademicSubjects from "./pages/common/Academicsubjects/AcademicSubjects";
import ContactUs from "./pages/common/Contactus/ContactUs";
import Login from "./pages/common/authentication/Login";
import SingleBlogPage from "./pages/common/SingleBlog/SingleBlog";
import Signup from "./pages/common/authentication/Signup";
import ChangePassword from "./pages/common/authentication/ChangePassword";
import ForgotPassword from "./pages/common/authentication/ForgotPassword";

import Logout from "./pages/common/authentication/Logout";

import Profile from "./pages/clients/Profile/Profile";

import CompletedOrders from "./pages/clients/Orders/CompletedOrders";

import InRevision from "./pages/clients/InRevision/InRevision";

import InProgress from "./pages/clients/InProgress/InProgress";

import ProtectedRoutes from "./pages/common/authentication/ProtectedRoutes";

import GetOrders from "./pages/clients/GetOrders/GetOrders";

import AddWork from "./pages/Admin/AddWork";

import Writers from "./pages/Admin/Writers";

import WorkOrder from "./pages/Admin/Work";

import MyBids from "./pages/clients/MyBids/MyBids";

import Withdrawals from "./pages/clients/Withdrawals/Withdrawals";

import AssignedWork from "./pages/Admin/AssignedWork";

import SubmitOrders from "./pages/clients/SubmitOrders/SubmitOrders";

import SubmittedOrders from "./pages/Admin/SubmittedOrders";

import AdminWithdrawal from "./pages/Admin/AdminWithdrawals";

import InReview from "./pages/clients/InReview/InReview";

import VerifyEmail from "./pages/common/authentication/VerifyEmail";

import RefundedOrders from "./pages/Admin/RefundedOrders";

import CancelledOrders from "./pages/Admin/CancelledOrders";

import PendingApplications from "./pages/Admin/PendingApplications";

import AssignedOrders from "./pages/Admin/AssignedOrders";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/academic-blogs" element={<AcademicBlog />} />
        <Route path="/academic-blogs/:blogId" element={<SingleBlogPage />} />
        <Route path="/academic-subjects" element={<AcademicSubjects />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/authentication/verify-email" element={<VerifyEmail />} />
        <Route path="/change-password/:token" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/client/get-orders"
          element={
            <ProtectedRoutes>
              <GetOrders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/client/complete-orders"
          element={
            <ProtectedRoutes>
              <CompletedOrders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/client/profile"
          element={
            <ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/client/in-revision"
          element={
            <ProtectedRoutes>
              <InRevision />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/client/in-progress"
          element={
            <ProtectedRoutes>
              <InProgress />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/writer/my-bids"
          element={
            <ProtectedRoutes>
              <MyBids />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/writer/withdrawals"
          element={
            <ProtectedRoutes>
              <Withdrawals />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/add-work"
          element={
            <ProtectedRoutes>
              <AddWork />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/writers"
          element={
            <ProtectedRoutes>
              <Writers />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/work-order"
          element={
            <ProtectedRoutes>
              <WorkOrder />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/assigned-orders"
          element={
            <ProtectedRoutes>
              <AssignedWork />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/writer/submit-work"
          element={
            <ProtectedRoutes>
              <SubmitOrders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/writer/in-review"
          element={
            <ProtectedRoutes>
              <InReview />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/submitted-work"
          element={
            <ProtectedRoutes>
              <SubmittedOrders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <ProtectedRoutes>
              <AdminWithdrawal />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/orders/cancelled"
          element={
            <ProtectedRoutes>
              <CancelledOrders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/orders/refunded"
          element={
            <ProtectedRoutes>
              <RefundedOrders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/pending-applications"
          element={
            <ProtectedRoutes>
              <PendingApplications />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/admin/assigned-assignments"
          element={
            <ProtectedRoutes>
              <AssignedOrders />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
