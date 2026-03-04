import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import StudentDashboard from "./pages/StudentDashboard";
import BrowseOpportunities from "./pages/BrowseOpportunities";
import MyApplications from "./pages/MyApplications";
import FacultyDashboard from "./pages/FacultyDashboard";
import CreatePosting from "./pages/CreatePosting";
import MyPostings from "./pages/MyPostings";
import FacultyApplications from "./pages/FacultyApplications";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/student" element={<Layout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="browse" element={<BrowseOpportunities />} />
          <Route path="applications" element={<MyApplications />} />
        </Route>

        <Route path="/faculty" element={<Layout />}>
          <Route index element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="create-posting" element={<CreatePosting />} />
          <Route path="my-postings" element={<MyPostings />} />
          <Route path="applications" element={<FacultyApplications />} />
        </Route>

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;