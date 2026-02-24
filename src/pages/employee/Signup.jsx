import { useState } from "react";
import {
  CognitoUserPool
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-1_02MgCUKuF",
  ClientId: "43i5bfdu4slkit4k31bvrufgqt",
};

const userPool = new CognitoUserPool(poolData);

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    userPool.signUp(email, password, [], null, (err, result) => {
      if (err) {
        setError(err.message);
        return;
      }
      setSuccess("Signup successful. Check your email.");
    });
  };

  return (
    <form onSubmit={handleSignup}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign Up</button>

      {error && <p style={{color:"red"}}>{error}</p>}
      {success && <p style={{color:"green"}}>{success}</p>}
    </form>
  );
}
