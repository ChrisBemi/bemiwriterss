import CloseIcon from "../assets/icons/close.png";
import "./ShareblogModal.css";
const ShareblogModal = ({ handleShowBlogModal, shareBlog }) => {
  return (
    <div
      className={`share-blog-modal modal-displayer ${
        shareBlog ? "active" : null
      }`}
    >
      <img
        src={CloseIcon}
        alt=""
        className="close-icon"
        onClick={handleShowBlogModal}
      />
      <div className={`modal-body ${shareBlog ? "active" : null}`}>
        <p className="medium-header">Share</p>
        <div className="flex">
          <p>
            <i class="fa-brands fa-square-facebook"></i>
          </p>
          <p>
            <i class="fa-brands fa-x-twitter"></i>
          </p>
          <p>
            <i class="fa-brands fa-linkedin"></i>
          </p>
          <p>
            <i class="fa-solid fa-link"></i>
          </p>
        </div>
      </div>
    </div>
  );
};
export default ShareblogModal;
