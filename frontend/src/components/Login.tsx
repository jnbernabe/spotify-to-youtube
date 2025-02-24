import React from "react";
import { Button } from "@mui/material";
import { loginWithSpotify } from "../api";

const Login: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login to Spotify</h2>
      <Button variant="contained" color="primary" onClick={loginWithSpotify}>
        Login with Spotify
      </Button>
    </div>
  );
};

export default Login;
