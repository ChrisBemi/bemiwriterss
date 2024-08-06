import "./AccountNavbar.css";
import { Link } from "react-router-dom";
import UserLogo from "../../../assets/icons/user.png";
import MenuIcon from "../../../assets/icons/menu_bar.png";
import { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../../Config";
import headers from "../../../headers";

const AccountNavbar = ({ sidebar, handleShowSidebar, title }) => {
  const [user, setUser] = useState(null);
  const [displayDropDown, setDisplayDropDown] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/users/${sessionStorage.getItem("userId")}`,
        {
          headers,
        }
      );
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("userId")) {
      fetchUser();
    }
  }, [sessionStorage.getItem("userId")]);

  const handleDisplayDropDown = () => {
    setDisplayDropDown(!displayDropDown);
  };

  if (loading) {
    return (
      <nav className="navbar">
        <p>Loading...</p>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="navbar">
        <p>Error fetching user data.</p>
      </nav>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <nav className="navbar">
      <div className="container flex">
        <div className="menu-icon" onClick={handleShowSidebar}>
          <img src={MenuIcon} alt="Menu" />
        </div>

        <div className="middle-navigation">
          <p className="description">USER ID: {user.systemId}</p>
          <p className="description">{`TOTAL EARNINGS: Ksh.${user.amount}`}</p>

          <p />
          <p className="description">{title}</p>
          <p className="description">ACCOUNT</p>
        </div>

        <div className="middle-navigation mobile">
          <div>
            <p
              style={{
                fontWeight: "600",
                textAlign: "start",
                color: "var(--blue)",
                fontSize: "12px",
              }}
            >
              EARNINGS:
            </p>
            <p
              style={{
                fontWeight: "600",
                textAlign: "start",
                color: "var(--blue)",
                fontSize: "12px",
              }}
            >{`Ksh. ${user.amount}`}</p>
          </div>

          {/* <p
            className="description"
            style={{ fontSize: "12px", fontWeight: "600" }}
          >{`TOTAL EARNINGS:Ksh.${user.amount}`}</p> */}
          <div>
            <p
              style={{
                fontWeight: "600",
                color: "var(--blue)",
                fontSize: "12px",
              }}
            >
              {title}
            </p>
          </div>
        </div>

        <div className="profile-section flex">
          <div className="img-wrapper">
            <Link to="/client/profile">
              <img
                src={user.profileUrl ? user.profileUrl : UserLogo}
                alt="Profile"
                className="profile-image"
                style={{ borderRadius: "5rem" }}
              />
            </Link>
          </div>
          <div className="arrow" onClick={handleDisplayDropDown}>
            <p>
              <i className="fa fa-caret-up"></i>
            </p>
          </div>
          <div className={`drop-down ${displayDropDown ? "active" : ""}`}>
            {isAdmin && (
              <Link to="/admin/add-work">
                <button className="medium-btns">ADMIN</button>
              </Link>
            )}
            <Link to="/">
              <button className="medium-btns">HOME</button>
            </Link>
            <Link to="/logout">
              <button className="medium-btns">LOGOUT</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AccountNavbar;
