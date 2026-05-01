// Login.jsx
import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({});
  const { login } = useContext(AuthContext);

  const handleSubmit = async () => {
    const res = await axios.post("http://localhost:5000/api/login", form);
    login(res.data);
  };

  return (
    <div>
      <input placeholder="email" onChange={e => setForm({...form, email:e.target.value})}/>
      <input placeholder="password" onChange={e => setForm({...form, password:e.target.value})}/>
      <button onClick={handleSubmit}>Login</button>
    </div>
  );
};

export default Login;