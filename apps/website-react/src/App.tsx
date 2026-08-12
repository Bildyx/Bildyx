import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Mission from "./pages/Mission";
import Company from "./pages/Company";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsService from "./pages/TermsService";
import WhyBuiltIt from "./pages/WhyBuiltIt";
import Generic from "./pages/Generic";
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

      {/* Not yet migrated — placeholders so nav links don't 404 */}
      <Route path="/login" element={<NotYetMigrated name="Log In / Sign Up" originalFile="login.php" />} />
      <Route path="/forgot-password" element={<NotYetMigrated name="Forgot Password" originalFile="forgot-password.php" />} />
      <Route path="/reset-password" element={<NotYetMigrated name="Reset Password" originalFile="reset-password.php" />} />
      <Route path="/verify-email" element={<NotYetMigrated name="Verify Email" originalFile="verify-email.php" />} />
      <Route path="/profile" element={<NotYetMigrated name="Profile" originalFile="profile.php" />} />
      <Route path="/microresume" element={<NotYetMigrated name="Create MicroResume" originalFile="microresume.php" />} />
      <Route path="/microresume-example" element={<NotYetMigrated name="MicroResume Example" originalFile="microresume-example.php" />} />
      <Route path="/target-list" element={<NotYetMigrated name="Target List" originalFile="target-list.php" />} />
      <Route path="/my-jobs" element={<NotYetMigrated name="My Jobs" originalFile="my-jobs.php" />} />
      <Route path="/tests-preferences" element={<NotYetMigrated name="Tests & Preferences" originalFile="tests-preferences.php" />} />
      <Route path="/team-example" element={<NotYetMigrated name="Team Example" originalFile="team-example.php" />} />
      <Route path="/why-teams" element={<NotYetMigrated name="Why Teams" originalFile="why-teams.php" />} />
      <Route path="/company-archives" element={<NotYetMigrated name="Company Archives" originalFile="company-archives.php" />} />
      <Route path="/company-con" element={<NotYetMigrated name="Company (Connected)" originalFile="company_con.php" />} />
      <Route path="/company-admin" element={<NotYetMigrated name="Company Admin" originalFile="company_con_admin.php" />} />

      <Route path="*" element={<NotYetMigrated name="Not Found" originalFile="(no PHP equivalent)" />} />
    </Routes>
  );
}
