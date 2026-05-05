// AddProperty.jsx
import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const AddProperty = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({});

  const handleSubmit = async () => {
    await axios.post(
      "http://localhost:8000/api/property",
      data,
      {
        headers: {
          Authorization: user.token,
        },
      }
    );
    alert("Property added");
  };

  return (
    <div>
      <input placeholder="title" onChange={e => setData({...data, title:e.target.value})}/>
      <textarea placeholder="description" onChange={e => setData({...data, description:e.target.value})}/>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default AddProperty;