import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Signup = () => {
  // State to manage user input data, error messages, and success messages
  const [data, setData] = useState({
    username: "",
    contact: "",
    email: "",
    password: "",
    confirmpassword: "", 
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Function to handle changes in input fields
  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API endpoint for user registration
      const url = "http://localhost:4000/users/register";

      // Sending a POST request to the server for user registration
      const { data: res } = await axios.post(url, data);

      // Setting success message and clearing any previous errors on success
      setMsg(res.message);
      setError("");
    } catch (error) {
      // Handling errors during user registration
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  // JSX for the signup form
  return (
    <div className={styles.signup_container}>
      <div className={styles.signup_form_container}>
        <div className={styles.left}>
          <h1>Welcome Back</h1>
          {/* Link to navigate to the login page */}
          <Link to="/login">
            <button type="button" className={styles.white_btn}>
              Sign in
            </button>
          </Link>
        </div>
        <div className={styles.right}>
          {/* Form for user signup */}
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Create Account</h1>
            {/* Input fields for user registration */}
            <input
              type="text"
              placeholder="User Name"
              name="username"
              onChange={handleChange}
              value={data.username}
              required
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Contact"
              name="contact"
              onChange={handleChange}
              value={data.contact}
              required
              className={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmpassword" // Updated the name for confirm password
              onChange={handleChange}
              value={data.confirmpassword}
              required
              className={styles.input}
            />
            {/* Display error and success messages */}
            {error && <div className={styles.error_msg}>{error}</div>}
            {msg && <div className={styles.success_msg}>{msg}</div>}
            {/* Submit button for the signup form */}
            <button type="submit" className={styles.green_btn}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
