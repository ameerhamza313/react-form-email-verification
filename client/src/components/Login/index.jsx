import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Login = () => {
  // State to manage user input data and error messages
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Function to handle changes in input fields
  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API endpoint for user login
      const url = "http://localhost:4000/users/login";

      // Sending a POST request to the server for user login
      const { data: res } = await axios.post(url, data);

      // Storing the user token in local storage for authentication
      localStorage.setItem("token", res.data);

      // Redirecting the user to the home page after successful login
      window.location = "/";
    } catch (error) {
      // Handling errors during login
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  // JSX for the login form
  return (
    <div className={styles.login_container}>
      <div className={styles.login_form_container}>
        <div className={styles.left}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Login to Your Account</h1>
            {/* Input fields for email and password */}
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
            {/* Display error message if login fails */}
            {error && <div className={styles.error_msg}>{error}</div>}
            {/* Submit button for the login form */}
            <button type="submit" className={styles.green_btn}>
              Sign In
            </button>
          </form>
        </div>
        <div className={styles.right}>
          {/* Option for new users to navigate to the registration page */}
          <h1>New Here ?</h1>
          <Link to="/register">
            <button type="button" className={styles.white_btn}>
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
