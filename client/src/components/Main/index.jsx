import styles from "./styles.module.css";

const Main = () => {
  // Function to handle user logout
  const handleLogout = () => {
    // Removing the user token from local storage
    localStorage.removeItem("token");

    // Reloading the window to reflect the logout state
    window.location.reload();
  };

  // JSX for the main component
  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <h1>Welcome</h1>
        {/* Logout button with click event to trigger the handleLogout function */}
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Main;
