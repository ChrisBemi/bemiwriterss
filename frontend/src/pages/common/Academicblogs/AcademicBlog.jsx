import HomeNavbar from "../../../components/HomeNavbar/HomeNavbar";
import "./AcademicBlog.css";
import BlogItem from "../../../components/BlogItem";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Config from "../../../Config";




const AcademicBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchBlogs(page);
    console.log(blogs)
  }, [page]);

  const fetchBlogs = async (pageNumber) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/blog/all?page=${pageNumber}&limit=5`
      );
      if (response.data.success) {
        setBlogs(response.data.data); 
        setTotalPages(response.data.totalPages);
        console.log(fetchBlogs.data.data)
      } else {
        console.log("There was a problem accessing data from the backend");
      }
    } catch (error) {
      console.log(`There was a problem accessing server ${error.message}`);
    }
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => prevPage - 1);
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={i === page}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="admin academic-blog">
      <HomeNavbar />
      <div className="container">
        <div className="search_container flex">
          <Link to="#" className="description flex">
            <div className="row">
              <p>All Posts</p>
              <p>
                <i className="fa-solid fa-arrow-right"></i>
              </p>
            </div>
          </Link>
          <div className="search_bar flex">
            <input type="text" placeholder="Type the blog title..." />
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
        </div>
        <div className="blogs">
          {blogs.map((blog) => (
            <BlogItem key={blog.id}  blog={blog} />
          ))}
        </div>
        <div className="pagination">
          {renderPageNumbers()}
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="navigation-btns"
          >
            Prev
          </button>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="navigation-btns"
          >
            Next
          </button>
        </div>
        <p>
          Page {page} of {totalPages}
        </p>
      </div>
    </div>
  );
};

export default AcademicBlog;
