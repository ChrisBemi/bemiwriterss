import Profile from "../assets/icons/user.png";
const BlogProfileCard = () => {
  return (
    <div className="profile-container flex">
      <img src={Profile} alt="" className="profile-image" />
      <div className="profile-description">
        <p>bemieditors</p>
        <p>Oct 12,2021. 2min</p>
      </div>
    </div>
  );
};

export default BlogProfileCard;
