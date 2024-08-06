import React, { useState } from "react";

import EmailingIcon from "../../assets/images/email.svg";

const Notifications = () => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!subject.trim()) {
      errors.subject = "Subject is required";
    }
    if (!message.trim()) {
      errors.message = "Message is required";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      // Call API to send notification
      console.log({ subject, message });
      // Reset form
      setSubject("");
      setMessage("");
    }
  };

  return (
    <div className="notification">
      <p className="medium-header">SENT NOTIFICATION TO WRITERS</p>
      <form className="notification-form" onSubmit={handleSubmit}>
        <div className="col">
          <img
            src={EmailingIcon}
            alt=""
            style={{ width: "350px", height: "200px" }}
          />
          <div className="input-group">
            <input
              type="text"
              name="subject"
              placeholder="Enter message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            {errors.subject && <p className="error">{errors.subject}</p>}
          </div>
        </div>
        <div className="col">
          <div className="input_group">
            <textarea
              name="message"
              placeholder="Type Notification............"
              cols={10}
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            {errors.message && <p className="error">{errors.message}</p>}
          </div>

          <input type="submit" className="submit-btn" value="SUBMIT" />
        </div>
      </form>
    </div>
  );
};

export default Notifications;
