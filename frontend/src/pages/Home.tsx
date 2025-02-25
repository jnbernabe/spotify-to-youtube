import React from "react";
import Login from "../components/Login";

interface HomeProps {
  onLogin: (accessToken: string, refreshToken: string, expiresIn: number) => void;
}

const Home: React.FC<HomeProps> = ({ onLogin }) => {
  return <Login onLogin={onLogin} />;
};

export default Home;
