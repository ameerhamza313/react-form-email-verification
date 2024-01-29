import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

const Signup = () => {
  const [data, setData] = useState({
    username: "",
    contact: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({});

    try {
      const url = "http://localhost:4000/user/register";
      const { data: res } = await axios.post(url, data);

      // Clear previous errors and success message
      setErrors({});
      setMsg({});

      setMsg({ success: res.message });

      // Clear the form data on successful registration
      setData({
        username: "",
        contact: "",
        email: "",
        password: "",
        confirmpassword: "",
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Destructure errors from the server response
        const { errors: serverErrors } = error.response.data;
        setErrors(serverErrors);
      } else {
        setMsg({ error: "Registration failed. Please try again later." });
      }
    }
  };

  return (
    <div className={styles.signup_container}>
      <div className={styles.signup_form_container}>
        <div className={styles.left}>
          <h1>Welcome Back</h1>
          <Link to="/login">
            <button type="button" className={styles.white_btn}>
              Sign in
            </button>
          </Link>
        </div>
        <div className={styles.right}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Create Account</h1>

            <input
              type="text"
              placeholder="User Name"
              name="username"
              onChange={(e) => setData({ ...data, username: e.target.value })}
              value={data.username}
              required
              className={styles.input}
            />
            {errors.username && (
              <div className={styles.error_msg}>{errors.username}</div>
            )}

            <PhoneInput
              country={"in"}
              value={data.contact}
              onChange={(value, country, e, formattedValue) => {
                const adjustedValue = value.startsWith("+")
                  ? value
                  : `+${value}`;
                setData({ ...data, contact: adjustedValue });
              }}
              onBlur={() => {}}
              inputProps={{
                required: true,
                name: "contact",
                placeholder: "Contact Number",
              }}
            />
            {errors.contact && (
              <div className={styles.error_msg}>{errors.contact}</div>
            )}

            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={(e) => setData({ ...data, email: e.target.value })}
              value={data.email}
              required
              className={styles.input}
            />
            {errors.email && (
              <div className={styles.error_msg}>{errors.email}</div>
            )}

            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={(e) => setData({ ...data, password: e.target.value })}
              value={data.password}
              required
              className={styles.input}
            />
            {errors.password && (
              <div className={styles.error_msg}>{errors.password}</div>
            )}

            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmpassword"
              onChange={(e) =>
                setData({ ...data, confirmpassword: e.target.value })
              }
              value={data.confirmpassword}
              required
              className={styles.input}
            />
            {errors.confirmpassword && (
              <div className={styles.error_msg}>{errors.confirmpassword}</div>
            )}

            {msg.success && (
              <div className={styles.success_msg}>{msg.success}</div>
            )}
            {msg.error && <div className={styles.error_msg}>{msg.error}</div>}
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
