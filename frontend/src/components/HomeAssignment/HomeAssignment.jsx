import { assingments } from "../../data/assingmentdata";
import "./HomeAssignment.css";
const HomeAssignment = () => {
  return (
    <div className="assingment-types">
      <div className="container">
        <p className="medium-header">Types of Assignments Help</p>
        <div className="grid">
          {assingments.map((assingment) => (
            <div className="card">
              <div className="img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt=""
                />
              </div>
              <div className="card-body">
                <p className="card-headers">{`${assingment.title} ${assingment.price}`}</p>
                {assingment.words && (
                  <p className="medium-header">{assingment.words}</p>
                )}
                <p className="description">{assingment.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeAssignment;
