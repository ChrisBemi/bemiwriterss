import "./HomeNavbar.css";
import { NavLink } from "react-router-dom";
import Bemi from "../../assets/icons/bemi.png";
import MenuIcon from "../../assets/icons/menu.png";
import CloseIcon from "../../assets/icons/close.png";
import { useContext, useState } from "react";
import AuthContext from "../../AuthContext";
const HomeNavbar = () => {
  const { isAuthenticated } = useContext(AuthContext);

  const [navbar, showNavbar] = useState(false);

  const handleNavbar = () => {
    showNavbar(!navbar);
  };

  return (
    <nav className="navbar home">
      <div className="container">
        <div className="logo">
          <img src={Bemi} alt="Bemi editors" />
        </div>
        <div className={`middle-navigation ${navbar ? "active" : null}`}>
          <p className="description">
            <NavLink to="/" activeClassName="active">
              Home
            </NavLink>
          </p>
          <p className="description">
            <NavLink to="/contact-us" activeClassName="active">
              Contact us
            </NavLink>
          </p>
          {/* {isAuthenticated ? (
            <p className="description">
              <NavLink to="/logout" activeClassName="active">
                Logout
              </NavLink>
            </p>
          ) : (
            <p className="description">
              <NavLink to="/login" activeClassName="active">
                Login
              </NavLink>
            </p>
          )} */}
          <p className="description">
            <NavLink to="/login" activeClassName="active">
              Login
            </NavLink>
          </p>
        </div>
        <div className="social-media">
          <p>
            {" "}
            <i className="fa-brands fa-square-twitter"></i>
          </p>
          <p>
            <i className="fa-brands fa-square-instagram"></i>
          </p>
          <p>
            <i className="fa-brands fa-square-facebook"></i>
          </p>
        </div>
        {navbar ? (
          <div className="menu-icon" onClick={handleNavbar}>
            <img src={CloseIcon} alt="" />
          </div>
        ) : (
          <div className="menu-icon" onClick={handleNavbar}>
            <img src={MenuIcon} alt="" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNavbar;
