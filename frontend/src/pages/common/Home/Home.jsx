import { useEffect } from "react"; 
import "./Home.css";
import HomeNavbar from "../../../components/HomeNavbar/HomeNavbar";
import Hero from "../../../components/Hero/Hero";
import HomeAssignment from "../../../components/HomeAssignment/HomeAssignment";
import Footer from "../../../components/Footer/Footer";
const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="home">
      <HomeNavbar />
      <Hero />
      {/* <HomeAssignment/> */}
      <Footer/>
    </div>
  );
};

export default Home;
