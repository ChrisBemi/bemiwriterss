import Logo from "../../../assets/icons/bemi.png";
import { Link } from "react-router-dom";
const Welcome = () => {
  return (
    <div className="authentication_controller_page">
      <div className="container">
        <div className="welcome_wrapper">
          <img src={Logo} className="logo" alt="" />
          <p className="medium-header">WELCOME TO BM EDITORS</p>
          <p className="">Don't have an account?</p>
          <Link to="/signup" className="universal-btn">
            SIGNUP
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
