import "./Footer.css";
import Paypal from "../../assets/icons/paypal.png";
import Remitly from "../../assets/icons/reference.png";
import Payoneer from "../../assets/icons/money (1).png";

const Footer = () => {
  return (
    <div className="footer">
      <div className="container">
        <div className="row">
          <p className="description">&copy; 2024 by Bemi Editors</p>
          <p className="description">Contact us</p>
        </div>
        <div className="row">
          <p className="description">Tel: +254 707 559877</p>
          <p className="description">Email: bmeditors@gmail.com</p>
        </div>
        <div className="transfer">
          <div className="row">
            <div className="card">
              <img src={Paypal} alt="" />
            </div>
            <div className="card">
              <img src={Payoneer} alt="" />
            </div>
            <div className="card">
              <img src={Remitly} alt="" />
            </div>
            <div className="card">
              <img src={Payoneer} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
