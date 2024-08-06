import HomeNavbar from "../../../components/HomeNavbar/HomeNavbar";

import Footer from "../../../components/Footer/Footer";

import { useEffect } from "react";

import "./AcademicSubjects.css";

import {
  writing,
  business,
  humanities,
  Science,
} from "../../../data/assingmentdata";

const AcademicSubjects = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="academic-subject">
      <HomeNavbar />
      <p className="empty"></p>
      <p className="medium-header">SUBJECTS PROFICIENCY</p>
      <div className="container">
        <p className="description">
          My team and I, have an accumulative experience in the subjects listed
          below.
          <br />
          We are guaranteeing you that your assignment is on safe hands. Your
          grades will speak volume.
          <br />
          In case you do not get a satisfying result, we will refund your money
          in full...Yes, we are that confident that we wont disappoint you!
        </p>
        <div className="grid">
          <div className="card">
            <p className="card-headers">WRITING</p>
            {writing.map((subject) => (
              <p>{`${subject.id}.  ${subject.title}`}</p>
            ))}
          </div>
          <div className="card">
            <p className="card-headers">HUMANITIES</p>

            {humanities.map((subject) => (
              <p>{`${subject.id}.  ${subject.title}`}</p>
            ))}
          </div>

          <div className="card">
            <p className="card-headers">BUSINESS</p>
            {business.map((subject) => (
              <p>{`${subject.id}.  ${subject.title}`}</p>
            ))}
          </div>
          <div className="card">
            <p className="card-headers">SCIENCE</p>
            {Science.map((subject) => (
              <p>{`${subject.id}.  ${subject.title}`}</p>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AcademicSubjects;
