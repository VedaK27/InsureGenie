import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Login() {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log(credentialResponse);

        fetch("http://localhost:8000/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: credentialResponse.credential,
          }),
        });
      }}
      onError={() => console.log("Login Failed")}
    />
  );
}

export default Login;