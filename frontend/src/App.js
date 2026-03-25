import logo from './logo.jpg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login"; 
import {useNavigate} from "react-router-dom";

function Home() {
  const navigate = useNavigate();


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Please login to cast your vote!</p>
        <button className="big-button" onClick={() => navigate("/login")}>
          Login
        </button>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;