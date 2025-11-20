import { useState } from "react";
import "./App.css";

function App() {
  const [userData, SetUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  async function handleClick() {
    let data = await fetch("http://localhost:3000/users",{
      method:"POST",
      body:JSON.stringify(userData),
      headers:{
        "Content-Type":"application/json"
      }
    })
    let res = await data.json()
    alert(res.message)
    }
  return (
    <div>
      <h1>Sign Up</h1>
      <input
        onChange={(e) =>
          SetUserData((prev) => ({ ...prev, name: e.target.value }))
        }
        type="text"
        placeholder="name"
      />
      <br />
      <br />
      <input onChange={(e) =>
          SetUserData((prev) => ({ ...prev, email: e.target.value }))
        } type="text" placeholder="email" />
      <br />
      <br />
      <input onChange={(e) =>
          SetUserData((prev) => ({ ...prev, password: e.target.value }))
        } type="text" placeholder="password" />
      <br />
      <br />
      <button onClick={handleClick}>Submit</button>
    </div>
  );
}

export default App;
