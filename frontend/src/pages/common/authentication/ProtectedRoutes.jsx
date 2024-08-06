import { Navigate } from "react-router-dom";

import AuthContext from "../../../AuthContext";
import { useContext } from "react";

const ProtectedRoutes = ({ children }) => {

   const { isAuthenticated } = useContext(AuthContext);



  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  } else {
    return children;
  }
};

export default ProtectedRoutes;



