import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Mission from "./pages/Mission";
import Company from "./pages/Company";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsService from "./pages/TermsService";
import WhyBuiltIt from "./pages/WhyBuiltIt";
import Generic from "./pages/Generic";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import CompanyArchives from "./pages/CompanyArchives";
import CompanyArchiveTrue from "./pages/CompanyArchiveTrue";
import Microresume from "./pages/Microresume";
import MicroresumeExample from "./pages/MicroresumeExample";
import WhyTeams from "./pages/WhyTeams";
import TeamExample from "./pages/TeamExample";
import MyJobs from "./pages/MyJobs";
import TargetList from "./pages/TargetList";
import Login from "./pages/Login";
import TestsPreferences from "./pages/TestsPreferences";
import Test from "./pages/Test";
import ResultTest from "./pages/ResultTest";
import Profile from "./pages/Profile";
import CompanyProfile from "./pages/CompanyProfile";
import NotYetMigrated from "./pages/NotYetMigrated";

export default function App() {
  return (
    <Routes>
      {/* Migrated to React */}
      <Route path="/" element={<Home />} />
      <Route path="/mission" element={<Mission />} />
      <Route path="/company" element={<Company />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-service" element={<TermsService />} />
      <Route path="/why-built-it" element={<WhyBuiltIt />} />
      <Route path="/coming-soon/:page" element={<Generic />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/company-archives" element={<CompanyArchives />} />
      <Route
        path="/company-archive-connected"
        element={<CompanyArchiveTrue />}
      />
      <Route path="/microresume" element={<Microresume />} />
      <Route path="/microresume-example" element={<MicroresumeExample />} />
      <Route path="/why-teams" element={<WhyTeams />} />
      <Route path="/team-example" element={<TeamExample />} />
      <Route path="/my-jobs" element={<MyJobs />} />
      <Route path="/target-list" element={<TargetList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tests-preferences" element={<TestsPreferences />} />
      <Route path="/tests-preferences/test" element={<Test />} />
      <Route path="/tests-preferences/result" element={<ResultTest />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/:slug" element={<CompanyProfile />} />
      <Route path="/:slug/admin" element={<CompanyProfile />} />

      <Route
        path="*"
        element={
          <NotYetMigrated name="Not Found" originalFile="(no PHP equivalent)" />
        }
      />
    </Routes>
  );
}
