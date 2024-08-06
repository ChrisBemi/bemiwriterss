import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../AuthContext";
import { hideLoading, showLoading } from "../../../Redux/features/AlertSlice";
import { useSelector, useDispatch } from "react-redux";
import Preloader from "../../../Preloader/Preloader";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        navigate("/");
      } catch (error) {
        console.error(`An error occurred: ${error.message}`);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return <Preloader />;
};

export default Logout;
