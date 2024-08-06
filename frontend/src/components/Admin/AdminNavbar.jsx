import "./AdminNavbar.css";
import { Link } from "react-router-dom";
import UserLogo from "../../assets/icons/user.png";
import MenuIcon from "../../assets/icons/menu_bar.png";

import { useState } from "react";

import useUser from "../../userUser";

const AdminNavbar = ({ sidebar, handleShowSidebar, title }) => {
  const [displayDropDown, setDisplayDropDown] = useState(false);

  const handleDisplayDropDown = () => {
    setDisplayDropDown(!displayDropDown);
  };

  const user = useUser();

  return (
    <nav className="navbar admin">
      <div className="container flex">
        <div className="menu-icon" onClick={handleShowSidebar}>
          <img src={MenuIcon} alt="" />
        </div>
        <div className="middle-navigation">
          <p className="description">{`SYSTEM ID: ${user.systemId}`}</p>
          <p className="description">{title}</p>
          <p className="description">ACCOUNT</p>
        </div>
        <div className="middle-navigation mobile">
          <p
            className="description"
            style={{ fontSize: "12px", fontWeight: "600" }}
          >
            USER ID: 002
          </p>
          <p
            className="description"
            style={{ fontSize: "12px", fontWeight: "600" }}
          >
            {title}
          </p>
        </div>
        <div className="profile-section flex">
          <div className="img-wrapper">
            <Link to="/client/profile">
              <img
                src={user.profileUrl ? user.profileUrl : UserLogo}
                alt=""
                className="profile-image"
              
              />
            </Link>
          </div>

          <div className="arrow" onClick={handleDisplayDropDown}>
            <p>
              <i class="fa fa-caret-up"></i>
            </p>
          </div>
          <div className={`drop-down ${displayDropDown ? "active" : null}`}>
            <Link to="/client/get-orders">
              <button className="medium-btns">WRITER</button>
            </Link>
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

export default AdminNavbar;
