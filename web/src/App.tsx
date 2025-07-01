import { createContext, Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import Button from "./components/Form/Button";
import LayoutAuthenticated from "./layouts/LayoutAuthenticated";
import RouteWatcher from "./layouts/RouteWatcher";
import {
  AddCustomer,
  AddHost,
  AddUser,
  Assessment,
  Assessments,
  AssessmentUpsert,
  Categories,
  Customers,
  Dashboard,
  EditPoc,
  EditReport,
  Hosts,
  Login,
  ManageCategory,
  Profile,
  Users,
  VulnerabilityDetail,
  VulnerabilitySearch,
  VulnerabilityUpsert,
} from "./pages";
import LiveEditor from "./pages/LiveEditor";
import { Assessment as AssessmentObj, Customer } from "./types/common.types";

type GlobalContextType = {
  useCtxAssessment: [Partial<AssessmentObj>, Dispatch<SetStateAction<Partial<AssessmentObj>>>];
  useCtxCustomer: [Partial<Customer>, Dispatch<SetStateAction<Partial<Customer>>>];
  useDarkTheme: [boolean, Dispatch<SetStateAction<boolean>>];
};

export const GlobalContext = createContext<GlobalContextType>(null);

export default function App() {
  const useDarkTheme = useState(localStorage.getItem("darkMode") === "1");
  const [darkTheme] = useDarkTheme;
  const useCtxCustomer = useState<Partial<Customer>>();
  const useCtxAssessment = useState<Partial<AssessmentObj>>();

  useLayoutEffect(() => {
    localStorage.setItem("darkMode", darkTheme ? "1" : "0");
    document.documentElement.classList[darkTheme ? "add" : "remove"]("dark");
  }, [darkTheme]);

  return (
    <GlobalContext.Provider
      value={{
        useDarkTheme,
        useCtxCustomer,
        useCtxAssessment,
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={3 * 1000}
        closeOnClick
        pauseOnHover
        toastClassName="kryvea-toast"
      />
      <BrowserRouter>
        <RouteWatcher />
        <Routes>
          <Route element={<LayoutAuthenticated />}>
            <Route // remove after testing
              path="/toast"
              element={
                <Button
                  text="test"
                  onClick={() => {
                    toast.error("error");
                    toast.success("success");
                    toast.loading("loading");
                    toast.warning("warning");
                  }}
                />
              }
            />
            <Route path="/" element={<Navigate to={"/dashboard"} replace />} />

            {/* Dashboard and Profile */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Users */}
            <Route path="/users" element={<Users />} />
            <Route path="/add_user" element={<AddUser />} />

            {/* Customers */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/add_customer" element={<AddCustomer />} />
            <Route path="/customers/:customerId/targets" element={<Hosts />} />
            <Route path="/customers/:customerId/targets/add_host" element={<AddHost />} />
            <Route path="/customers/:customerId/assessments" element={<Assessments />} />
            <Route path="/customers/:customerId/assessments/new" element={<AssessmentUpsert />} />
            <Route path="/customers/:customerId/assessments/:assessmentId" element={<AssessmentUpsert />} />

            {/* Assessments */}
            <Route path="/assessments/:assessmentId/vulnerabilities" element={<Assessment />} />
            <Route
              path="/assessments/:assessmentId/vulnerabilities/add_vulnerability"
              element={<VulnerabilityUpsert />}
            />
            <Route
              path="/assessments/:assessmentId/vulnerabilities/:vulnerabilityId"
              element={<VulnerabilityUpsert />}
            />
            <Route
              path="/assessments/:assessmentId/vulnerabilities/:vulnerabilityId/detail"
              element={<VulnerabilityDetail />}
            />

            {/* Vulnerabilities */}
            <Route path="/vulnerability_search" element={<VulnerabilitySearch />} />
            <Route path="/vulnerabilities/:vulnerabilityId/pocs/edit" element={<EditPoc />} />

            {/* Categories */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/manage_category" element={<ManageCategory />} />
            <Route path="/manage_category/:categoryId" element={<ManageCategory />} />

            {/* Other */}
            <Route path="/edit_report" element={<EditReport />} />
            <Route path="/live_editor" element={<LiveEditor />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}
