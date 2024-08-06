import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./AddWrite.css";
import AssingmentDetails from "./AssingmentDetails";
import { useState } from "react";
const AddWork = () => {
  const [sidebar, showSidebar] = useState(false);
  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };
  return (
    <div className="admin">
      <AdminNavbar 
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="ADD ASSIGNMENT"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <AssingmentDetails />
      </div>
    </div>
  );
};

export default AddWork;
