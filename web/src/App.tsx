import { createContext, Dispatch, SetStateAction, useCallback, useLayoutEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import { getLocalStorageCtxState, GlobalContextKeys, setLocalStorageCtxState } from "./ctxPersistence";
import LayoutAuthenticated from "./layouts/LayoutAuthenticated";
import RouteWatcher from "./layouts/RouteWatcher";
import {
  AddCustomer,
  AddTarget,
  AddUser,
  Assessments,
  AssessmentUpsert,
  AssessmentVulnerabilities,
  Categories,
  CategoryUpsert,
  CustomerDetail,
  Customers,
  Dashboard,
  EditPoc,
  EditReport,
  Login,
  Profile,
  Targets,
  Users,
  VulnerabilityDetail,
  VulnerabilitySearch,
  VulnerabilityUpsert,
} from "./pages";
import LiveEditor from "./pages/LiveEditor";
import Logs from "./pages/Logs";
import Templates from "./pages/Templates";
import { Assessment as AssessmentObj, Category, Customer, Vulnerability } from "./types/common.types";

export type GlobalContextType = {
  useDarkTheme: [boolean, Dispatch<SetStateAction<boolean>>];
  useUsername: [string, Dispatch<SetStateAction<string>>];
  useFullscreen: [boolean, Dispatch<SetStateAction<boolean>>];
  useCtxAssessment: [Partial<AssessmentObj>, Dispatch<SetStateAction<Partial<AssessmentObj>>>];
  useCtxCustomer: [Customer, Dispatch<SetStateAction<Customer>>];
  useCtxVulnerability: [Partial<Vulnerability>, Dispatch<SetStateAction<Partial<Vulnerability>>>];
  useCtxCategory: [Category, Dispatch<SetStateAction<Category>>];
};

export const GlobalContext = createContext<GlobalContextType>(null);

export default function App() {
  const useDarkTheme = useState(() => getLocalStorageCtxState("useDarkTheme") ?? true);
  const [darkTheme] = useDarkTheme;
  const useUsername = useState<string>(() => getLocalStorageCtxState("useUsername") ?? "");
  const useFullscreen = useState(() => getLocalStorageCtxState("useFullscreen") ?? false);
  const useCtxCustomer = useState<Customer>(() => getLocalStorageCtxState("useCtxCustomer"));
  const useCtxAssessment = useState<Partial<AssessmentObj>>(() => getLocalStorageCtxState("useCtxAssessment"));
  const useCtxVulnerability = useState<Partial<Vulnerability>>(() => getLocalStorageCtxState("useCtxVulnerability"));
  const useCtxCategory = useState<Category>(() => getLocalStorageCtxState("useCtxCategory"));

  useLayoutEffect(() => {
    document.documentElement.classList[darkTheme ? "add" : "remove"]("dark");
  }, [darkTheme]);

  const bindToLocalStorage = useCallback(function <T>(
    [state, setState]: [T, Dispatch<SetStateAction<T>>],
    key: GlobalContextKeys
  ): [T, (newState: T | ((prevState: T) => T)) => any] {
    return [
      state,
      (value: T | ((prevState: T) => T)) => {
        if (typeof value === "function") {
          setState(prev => {
            const newValue = (value as CallableFunction)(prev);
            setLocalStorageCtxState(key, newValue);
            return newValue;
          });
          return;
        }
        setState(value);
        setLocalStorageCtxState(key, value);
      },
    ];
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        useDarkTheme: bindToLocalStorage(useDarkTheme, "useDarkTheme"),
        useUsername: bindToLocalStorage(useUsername, "useUsername"),
        useFullscreen: bindToLocalStorage(useFullscreen, "useFullscreen"),
        useCtxCustomer: bindToLocalStorage(useCtxCustomer, "useCtxCustomer"),
        useCtxAssessment: bindToLocalStorage(useCtxAssessment, "useCtxAssessment"),
        useCtxVulnerability: bindToLocalStorage(useCtxVulnerability, "useCtxVulnerability"),
        useCtxCategory: bindToLocalStorage(useCtxCategory, "useCtxCategory"),
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
        <Routes>
          <Route element={<RouteWatcher />}>
            <Route element={<LayoutAuthenticated />}>
              {/* Dashboard and Profile */}
              <Route path="/" element={<Navigate to={"/dashboard"} replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Users */}
              <Route path="/users" element={<Users />} />
              <Route path="/users/new" element={<AddUser />} />

              {/* Customers */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<AddCustomer />} />
              <Route path="/customers/:customerId" element={<CustomerDetail />} />
              <Route path="/customers/:customerId/targets" element={<Targets />} />
              <Route path="/customers/:customerId/targets/new" element={<AddTarget />} />
              <Route path="/customers/:customerId/assessments" element={<Assessments />} />
              <Route path="/customers/:customerId/assessments/new" element={<AssessmentUpsert />} />
              <Route path="/customers/:customerId/assessments/:assessmentId" element={<AssessmentUpsert />} />

              {/* Assessments */}
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities"
                element={<AssessmentVulnerabilities />}
              />
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities/new"
                element={<VulnerabilityUpsert />}
              />
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities/:vulnerabilityId"
                element={<VulnerabilityDetail />}
              />
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities/:vulnerabilityId/edit"
                element={<VulnerabilityUpsert />}
              />

              {/* Vulnerabilities */}
              <Route path="/vulnerability_search" element={<VulnerabilitySearch />} />
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities/:vulnerabilityId/pocs"
                element={<EditPoc />}
              />

              {/* Categories */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/new" element={<CategoryUpsert />} />
              <Route path="/categories/:categoryId" element={<CategoryUpsert />} />

              {/* Other */}
              <Route path="/edit_report" element={<EditReport />} />
              <Route path="/live_editor" element={<LiveEditor />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/templates" element={<Templates />} />
            </Route>
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}
