import "./Hero.css";
import Ceo from "../../assets/icons/ceo.png";
const Hero = () => {
  return (
    <div className="hero">
      <div className="container">
        <p className="empty"></p>
        <div className="row">
          <div className="card">
            <div className="img-wrapper">
              <img src={Ceo} alt="" />
            </div>
          </div>
          <div className="card">
            <p className="medium-header">Welcome to Bemi Editors!</p>
            <p className="description">
              We are thrilled to have you join our community of dedicated
              writers and editors. At Bemi Editors, we believe in the power of
              words and the impact they can have. Our mission is to provide a
              platform where talented writers can showcase their skills,
              collaborate on various assignments, and continually refine their
              craft. Whether you're here to take on challenging assignments,
              engage in thoughtful proofreading, or enhance your editing skills,
              Bemi Editors is the perfect place for you. We are committed to
              fostering a supportive environment that encourages growth,
              creativity, and excellence. Thank you for being a part of our
              journey. Together, we can achieve greatness and make a lasting
              impression through the art of writing.
              <br />
              Thank you.
            </p>
            <div className="details">
            
              <p className="card-headers">General Manager, BEMI EDITORS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
