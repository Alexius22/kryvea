import { createContext, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LayoutAuthenticated from "./src/layouts/LayoutAuthenticated";
import RouteWatcher from "./src/layouts/RouteWatcher";
import AddAssessment from "./src/pages/AddAssessment";
import AddCustomer from "./src/pages/AddCustomer";
import AddHost from "./src/pages/AddHost";
import AddUser from "./src/pages/AddUser";
import AddVulnerability from "./src/pages/AddVulnerability";
import Assessment from "./src/pages/Assessment";
import Assessments from "./src/pages/Assessments";
import Customer from "./src/pages/Customer";
import Customers from "./src/pages/Customers";
import Dashboard from "./src/pages/Dashboard";
import EditPoc from "./src/pages/EditPoc";
import EditReport from "./src/pages/EditReport";
import Error from "./src/pages/Error";
import Login from "./src/pages/Login";
import Profile from "./src/pages/Profile";
import Users from "./src/pages/Users";
import Vulnerabilities from "./src/pages/Vulnerabilities";
import Vulnerability from "./src/pages/Vulnerability";

export const GlobalContext = createContext<any>({});

export default function App() {
  const useUserEmail = useState<string>("test@email.com");
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
        <RouteWatcher />
        <Routes>
          <Route element={<LayoutAuthenticated />}>
            <Route path="/" element={<Navigate to={"/dashboard"} replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/users" element={<Users />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/vulnerability" element={<Vulnerability />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/add_customer" element={<AddCustomer />} />
            <Route path="/add_assessment" element={<AddAssessment />} />
            <Route path="/add_host" element={<AddHost />} />
            <Route path="/add_vulnerability" element={<AddVulnerability />} />
            <Route path="/add_user" element={<AddUser />} />
            <Route path="/edit_poc" element={<EditPoc />} />
            <Route path="/edit_report" element={<EditReport />} />
            <Route path="/error" element={<Error />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}
