import React, { useState } from "react";
import HomeNavbar from "../../../components/HomeNavbar/HomeNavbar";
import "./ContactUs.css";
import Footer from "../../../components/Footer/Footer";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear the error for the field being changed
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validate = () => {
    let errors = {};
    if (!formData.name) {
      errors.name = "Name is required";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }
    if (!formData.subject) {
      errors.subject = "Subject is required";
    }
    if (!formData.message) {
      errors.message = "Message is required";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      // Simulate form submission success
      setSubmitMessage(
        "Thank you for contacting us. We will get back to you soon."
      );
      console.log("Form submitted successfully:", formData);
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } else {
      setErrors(validationErrors);
      setSubmitMessage("");
    }
  };

  return (
    <div className="contacts-page">
      <HomeNavbar />
      <p className="empty"></p>
      <div className="container">
        <p className="medium-header">CONTACT US</p>
        <div className="flex">
          <form className="contact" onSubmit={handleSubmit}>
            <p style={{color:"var(--pinkRed)"}}>
              Please fill out the form below and we shall give you a response
              ASAP!
            </p>
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                aria-label="Name"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                aria-label="Email"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                aria-label="Subject"
              />
              {errors.subject && (
                <span className="error">{errors.subject}</span>
              )}
            </div>
            <div className="input-group" style={{border:"none"}}>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                cols="30"
                rows="10"
                placeholder="Message"
                aria-label="Message"
              ></textarea>
              {errors.message && (
                <span className="error">{errors.message}</span>
              )}
            </div>
            <input type="submit" value="SUBMIT" className="submit-btn" />
            {submitMessage && (
              <p className="success-message">{submitMessage}</p>
            )}
          </form>
          <div className="contact-information">
            <p>
              For all inquiries, please email us or text us via our WhatsApp
              number: +254 707 559877 anytime. We are available 24/7
            </p>
            <p className="large-font">Tel: +254 707 559877</p>
            <p className="large-font">Email: bemieditors@gmail.com</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
