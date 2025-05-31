import { createContext, Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LayoutAuthenticated from "./layouts/LayoutAuthenticated";
import RouteWatcher from "./layouts/RouteWatcher";
import {
  AddAssessment,
  AddCustomer,
  AddHost,
  AddUser,
  AddVulnerability,
  Assessment,
  Assessments,
  Customers,
  Dashboard,
  EditPoc,
  EditReport,
  Error,
  Login,
  Profile,
  Users,
  Vulnerabilities,
  Vulnerability,
} from "./pages";
import Categories from "./pages/Categories";
import Hosts from "./pages/Hosts";
import LiveEditor from "./pages/LiveEditor";
import ManageCategory from "./pages/ManageCategory";

export const GlobalContext = createContext<{
  useUsername: [string, Dispatch<SetStateAction<string>>];
  useCustomerName: [string, Dispatch<SetStateAction<string>>];
  useDarkTheme: [boolean, Dispatch<SetStateAction<boolean>>];
}>(null);

export default function App() {
  const useUsername = useState<string>("kryveaUser");
  const useCustomerName = useState<string>("");
  const useDarkTheme = useState(localStorage.getItem("darkMode") === "1");
  const [darkTheme, _] = useDarkTheme;

  useLayoutEffect(() => {
    localStorage.setItem("darkMode", darkTheme ? "1" : "0");
    document.body.classList[darkTheme ? "add" : "remove"]("dark-scrollbars");
    document.documentElement.classList[darkTheme ? "add" : "remove"]("dark", "dark-scrollbars-compat");
  }, [darkTheme]);

  return (
    <GlobalContext.Provider
      value={{
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
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/users" element={<Users />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/hosts" element={<Hosts />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/vulnerability" element={<Vulnerability />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add_customer" element={<AddCustomer />} />
            <Route path="/add_assessment" element={<AddAssessment />} />
            <Route path="/add_host" element={<AddHost />} />
            <Route path="/add_vulnerability" element={<AddVulnerability />} />
            <Route path="/add_user" element={<AddUser />} />
            <Route path="/edit_poc" element={<EditPoc />} />
            <Route path="/edit_report" element={<EditReport />} />
            <Route path="/error" element={<Error />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/manage_category" element={<ManageCategory />} />
            <Route path="/live_editor" element={<LiveEditor />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}
