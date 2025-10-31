// components/Signup.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        createdAt: new Date(),
      });
      setSuccess("Signup successful! Welcome, " + name);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center mt-[40px] justify-center min-h-screen bg-gray-50">
      <form 
        onSubmit={handleSignup} 
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-center font-medium">{success}</div>
        )}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button 
          type="submit" 
          className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link className="text-indigo-600 font-medium hover:underline" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
