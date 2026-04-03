import logo from "../assets/logo/logo.png";

function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <img
        src={logo}
        alt="Logo"
        style={{ width: "150px" }}
      />

      <h1>Welcome to the Project</h1>

      <p>
        InsurGenie : Your AI-Powered Insurance Advisor
      </p>
    </div>
  );
}

export default Home;