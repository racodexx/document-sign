import logo from "../../assets/logo.png";

const styles = {
  header: {
    position: "sticky",
    top: 0,
    width: "100%",
    height: "70px",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    padding: "0 40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    zIndex: 1000,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: "40px",
    marginRight: "12px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
    color: "#1e293b",
  },
};

 const AppHeader=() => {
  return (
    <header style={styles.header}>
    <section>
      <div style={styles.left}>
        <img src={logo} alt="Document Sign Logo" style={styles.logo} />
        <h1 style={styles.title}>Document Sign</h1>
      </div>
      </section>
    </header>
  );
}

export default AppHeader
