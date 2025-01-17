import { createContext, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LayoutAuthenticated from "./src/layouts/LayoutAuthenticated";
import Dashboard from "./src/pages/Dashboard";
import Customers from "./src/pages/Customers";
import Vulnerabilities from "./src/pages/Vulnerabilities";
import Users from "./src/pages/Users";
import Assessments from "./src/pages/Assessments";
import Vulnerability from "./src/pages/Vulnerability";

export const GlobalContext = createContext<any>({});

export default function App() {
  const useUserEmail = useState<string>("TestUser@email.com");
  const useUsername = useState<string>("TestUser");
  const useCustomerName = useState<string>("");
  const useDarkTheme = useState(localStorage.getItem("darkMode") === "1");
  const [darkTheme, _] = useDarkTheme;

  useEffect(() => {
    localStorage.setItem("darkMode", darkTheme ? "1" : "0");
    document.body.classList[darkTheme ? "add" : "remove"]("dark-scrollbars");
    document.documentElement.classList[darkTheme ? "add" : "remove"]("dark", "dark-scrollbars-compat");
  }, [darkTheme]);

  return (
    <GlobalContext.Provider
      value={{
        useUserEmail,
        useUsername,
        useCustomerName,
        useDarkTheme,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutAuthenticated />}>
            <Route path="/" element={<Navigate to={"/dashboard"} replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/users" element={<Users />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/vulnerability" element={<Vulnerability />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}
