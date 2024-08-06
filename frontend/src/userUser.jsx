import { useEffect, useState } from "react";
import Config from "./Config";
import headers from "./headers";
import axios from "axios";
const useUser = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
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
      }
    };

    fetchUser();
  }, []);

  return { ...user };
};

export default useUser;
