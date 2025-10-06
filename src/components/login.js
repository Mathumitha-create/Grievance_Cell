// Login component using Firebase Auth
import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-blue-900">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">
          Grievance Cell Login
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-blue-200 rounded-md p-3 mb-4 w-full focus:outline-none focus:border-blue-700 text-base"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-blue-200 rounded-md p-3 mb-4 w-full focus:outline-none focus:border-blue-700 text-base"
        />
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 w-full rounded-md text-lg transition-colors mb-4"
        >
          Login
        </button>
        <div className="flex items-center mb-4">
          <div className="flex-grow h-px bg-blue-200"></div>
          <span className="mx-2 text-blue-400 font-semibold">or</span>
          <div className="flex-grow h-px bg-blue-200"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-2 bg-white border border-blue-400 text-blue-700 font-bold py-3 w-full rounded-md text-lg shadow hover:bg-blue-50 transition-colors"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_17_40)">
              <path
                d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42H39.5C44 38.1 47.5 32.1 47.5 24.5Z"
                fill="#4285F4"
              />
              <path
                d="M24 48C30.6 48 36.1 45.9 39.5 42L31.8 36.4C29.9 37.6 27.6 38.3 24 38.3C17.7 38.3 12.2 34.2 10.3 28.7H2.3V34.4C5.7 41.1 14.1 48 24 48Z"
                fill="#34A853"
              />
              <path
                d="M10.3 28.7C9.7 26.9 9.4 24.9 9.4 23C9.4 21.1 9.7 19.1 10.3 17.3V11.6H2.3C0.8 14.4 0 17.6 0 21C0 24.4 0.8 27.6 2.3 30.4L10.3 28.7Z"
                fill="#FBBC05"
              />
              <path
                d="M24 9.7C27.1 9.7 29.7 10.8 31.7 12.7L39.6 5.1C36.1 1.9 30.6 0 24 0C14.1 0 5.7 6.9 2.3 13.6L10.3 19.3C12.2 13.8 17.7 9.7 24 9.7Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Sign in with Google
        </button>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
