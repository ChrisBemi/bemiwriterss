import React, { useState, useEffect } from "react";
import axios from "axios";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import ".././Clients.css";
import "./Profile.css";
import UpdateDescription from "./UpdateDescription";
import UpdateName from "./UpdateName";
import UpdateEmail from "./UpdateEmail";
import UpdatePhone from "./UpdatePhone";
import UpdatePassword from "./UpdatePassword";
import Config from "../../../Config";

import UpdateProfileImage from "./UpdateProfileImage";
import headers from "../../../headers";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [sidebar, showSidebar] = useState(false);
  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account profile">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="PROFILE"
      />
      <AccountSidebar sidebar={sidebar} />
      <p className="empty"></p>

      <div className="container">
        <p
          className="medium-header"
          style={{ color: "var(--blue)", textDecoration: "underline" }}
        >
          ONCE YOU HAVE MADE CHANGES KINDLY REFRESH THE BROWSER FOR EFFECTS TO
          TAKE PLACE
        </p>
        <div className="profile-container">
          <div className="col">
            <UpdateProfileImage />
            <div className="profile-details">
              <div className="row">
                <p className="profile-headers">Name</p>
                <p>{`${user.firstName} ${user.lastName}`}</p>
              </div>
              <div className="row">
                <p className="profile-headers">Email</p>
                <p>{user.email}</p>
              </div>
              <div className="row">
                <p className="profile-headers">Phone</p>
                <p>{user.phoneNo}</p>
              </div>
              <div className="row">
                <p className="profile-headers">Course</p>
                <p>{user.qualifications}</p>
              </div>
              <div className="description">{user.description}</div>
            </div>
          </div>
          <div className="col">
            <UpdateDescription user={user} />
            <UpdateName />
            <UpdateEmail />
            <UpdatePhone user={user} />
            <UpdatePassword />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
