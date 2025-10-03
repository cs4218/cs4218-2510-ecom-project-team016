import React, { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children, user = null, token = "" }) => {
  const [auth, _setAuth] = useState({
    user: user,
    token: token,
  });

  const setAuth = (auth) => {
    if (!auth) {
      setDefaultAuth();
      return;
    }

    if (!checkAuthContextValid(auth)) {
      setDefaultAuth();
      return;
    }

    _setAuth(auth);
  };

  const setDefaultAuth = () => {
    _setAuth({
      ...auth,
      user: null,
      token: "",
    });
  };

  //default axios
  axios.defaults.headers.common["Authorization"] = auth?.token;

  useEffect(() => {
    const data = localStorage.getItem("auth");

    if (data) {
      try {
        const parseData = JSON.parse(data);
        setAuth({
          ...auth,
          user: parseData.user,
          token: parseData.token,
        });
      } catch (error) {
        // Invalid JSON, ignore and use default state
        console.error("Invalid auth data in localStorage:", error);
      }
    }
    //eslint-disable-next-line
  }, []);
  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

const checkAuthContextValid = (parsedData) => {
  if (!parsedData || !parsedData.user || !parsedData.token) {
    return false;
  }

  const user = parsedData.user;
  return (
    user.hasOwnProperty("_id") &&
    user.hasOwnProperty("name") &&
    user.hasOwnProperty("email") &&
    user.hasOwnProperty("phone") &&
    user.hasOwnProperty("address") &&
    user.hasOwnProperty("role")
  );
};

// custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
