import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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

  const inputs = [
    { name: "username", pattern: "^[A-Za-z.]{3,16}$", errorMessage: "Username should be 3-16 characters and shouldn't include any special character & numbers" },
    { name: "contact", pattern: "", errorMessage: "Contact Number should be valid" }, // Phone number validation handled by library
    { name: "email", pattern: "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$", errorMessage: "It should be a valid email address!" },
    { name: "password", pattern: "^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$", errorMessage: "Password should be 6-16 characters and include at least 1 letter, 1 number, and 1 special character" },
  ];

  const handleChange = ({ target }) => {
    setData({ ...data, [target.name]: target.value });
    // Clear error in real-time only if it matches the regex pattern
    validateField(target.name, target.value);
  };

  const handleBlur = ({ target }) => {
    setTouched({ ...touched, [target.name]: true });
    // Validate the field on blur
    validateField(target.name, data[target.name]);
  };

  useEffect(() => {
    validateForm();
  }, [data]);

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    // Validate the specific field
    const inputDefinition = inputs.find((input) => input.name === fieldName);

    if (inputDefinition) {
      switch (fieldName) {
        case "username":
        case "email":
        case "password":
          newErrors[fieldName] =
            !String(value).match(new RegExp(inputDefinition.pattern)) && touched[fieldName]
              ? inputDefinition.errorMessage
              : "";
          break;
        case "contact":
          newErrors.contact =
            !value || value.trim().length === 0
              ? "Contact Number is required"
              : !/^\+?\d{6,}$/i.test(value) // Check if the contact number has at least 6 digits
              ? "Invalid Contact Number"
              : "";
          break;
        case "confirmpassword":
          newErrors.confirmpassword =
            data.password !== value && touched.confirmpassword
              ? "Passwords don't match!"
              : "";
          break;
        default:
          break;
      }

      // Set error as focused
      newErrors.focused = newErrors[fieldName];

      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    // Validate all fields
    validateField("username", data.username);
    // Phone number validation handled by library, no need to call validateField for "contact"
    validateField("email", data.email);
    validateField("password", data.password);
    validateField("confirmpassword", data.confirmpassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are no errors before submitting
    if (
      Object.values(errors).every((error) => error === "") &&
      Object.values(touched).every((touch) => touch === true)
    ) {
      try {
        const url = "http://localhost:4000/users/register";
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
              country={'in'} // You can set the default country or remove it
              value={data.contact}
              // className={`${styles.input} ${styles.phone_input}`}
              onChange={(value) => {
                setData({ ...data, contact: value });
                validateField("contact", value);
              }}
              onBlur={() => handleBlur({ target: { name: "contact" } })}
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
            {errors.email && <div className={styles.error_msg}>{errors.email}</div>}

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
