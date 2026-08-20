import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Mission from "./pages/static/Mission";
import Company from "./pages/company/Company";
import Contact from "./pages/static/Contact";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import TermsService from "./pages/static/TermsService";
import WhyBuiltIt from "./pages/static/WhyBuiltIt";
import Generic from "./pages/static/Generic";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import CompanyArchives from "./pages/company/CompanyArchives";
import CompanyArchiveTrue from "./pages/company/CompanyArchiveTrue";
import Microresume from "./pages/static/Microresume";
import MicroresumeExample from "./pages/static/MicroresumeExample";
import WhyTeams from "./pages/static/WhyTeams";
import TeamExample from "./pages/static/TeamExample";
import TargetList from "./pages/job-seeker/TargetList";
import Login from "./pages/auth/Login";
import TestsPreferences from "./pages/tests/TestsPreferences";
import Test from "./pages/tests/Test";
import ResultTest from "./pages/tests/ResultTest";
import Profile from "./pages/job-seeker/Profile";
import CompanyProfile from "./pages/company/CompanyProfile";
import NotYetMigrated from "./pages/static/NotYetMigrated";

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
