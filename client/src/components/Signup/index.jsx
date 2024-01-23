import React, { useState, useEffect } from "react";
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
  const [touched, setTouched] = useState({});

  const inputs = ["username", "contact", "email", "password"];

  const handleChange = ({ target }) => {
    setData({ ...data, [target.name]: target.value });
    setTouched({ ...touched, [target.name]: true });
  };

  const handleBlur = ({ target }) => {
    setTouched({ ...touched, [target.name]: true });
  };

  useEffect(() => {
    validateForm();
  }, [data]);

  const validateForm = () => {
    const newErrors = {};

    inputs.forEach((fieldName) => {
      if (!data[fieldName] && touched[fieldName]) {
        newErrors[fieldName] = `${fieldName
          .charAt(0)
          .toUpperCase()}${fieldName.slice(1)} is required`;
      } else {
        newErrors[fieldName] = "";
      }
    });

    // Validate passwords match
    if (data.password !== data.confirmpassword && touched.confirmpassword) {
      newErrors.confirmpassword = "Passwords don't match!";
    } else {
      newErrors.confirmpassword = "";
    }
    console.log("newErrors:", newErrors);
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are no errors before submitting
    if (Object.values(errors).every((error) => error === "")) {
      try {
        const url = "http://localhost:4000/user/register";
        const { data: res } = await axios.post(url, data);
        setMsg({ success: res.message });
      } catch (error) {
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          setMsg({ error: error.response.data.message });
        }
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
              onChange={handleChange}
              onBlur={handleBlur}
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
              onChange={handleChange}
              onBlur={handleBlur}
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
              onChange={handleChange}
              onBlur={handleBlur}
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
              onChange={handleChange}
              onBlur={handleBlur}
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
