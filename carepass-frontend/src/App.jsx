import { useMemo, useState } from "react";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import DocumentDetailsPage from "./pages/DocumentDetailsPage";
import DocumentFormPage from "./pages/DocumentFormPage";
import DocumentsPage from "./pages/DocumentsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import SharingPage from "./pages/SharingPage";
import VerificationPage from "./pages/VerificationPage";
import AgentAssessmentsPage from "./pages/AgentAssessmentsPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import CandidateJobsPage from "./pages/CandidateJobsPage";
import InstitutionDashboardPage from "./pages/InstitutionDashboardPage";
import JobFormPage from "./pages/JobFormPage";
import applicationService from "./services/applicationService";
import authService from "./services/authService";
import documentService from "./services/documentService";
import jobService from "./services/jobService";
import sharingService from "./services/sharingService";

export default function App() {
  const savedUser = authService.getCurrentUser();
  const [currentUser, setCurrentUser] = useState(savedUser);
  const [currentPage, setCurrentPage] = useState(savedUser ? "dashboard" : "home");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [documents, setDocuments] = useState(() => savedUser ? documentService.getDocuments(savedUser.id) : []);
  const [grants, setGrants] = useState(() => savedUser ? sharingService.getGrants(savedUser.id) : []);
  const [jobs, setJobs] = useState(() => jobService.getJobs());
  const [applications, setApplications] = useState(() => applicationService.getApplications());

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId) || null,
    [documents, selectedDocumentId],
  );

  function navigate(page) {
    if (!currentUser && !["home", "login", "register"].includes(page)) return setCurrentPage("login");
    if (page === "document-form" && currentPage !== "document-details") setSelectedDocumentId(null);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enterApplication(user) {
    setCurrentUser(user);
    setDocuments(documentService.getDocuments(user.id));
    setGrants(sharingService.getGrants(user.id));
    setJobs(jobService.getJobs());
    setApplications(applicationService.getApplications());
    setCurrentPage("dashboard");
  }

  function logout() {
    authService.logout();
    setCurrentUser(null);
    setDocuments([]);
    setGrants([]);
    setSelectedDocumentId(null);
    setCurrentPage("home");
  }

  async function saveDocument(formData, file) {
    if (selectedDocument) {
      const updated = await documentService.updateDocument(currentUser.id, selectedDocument.id, formData, file);
      setDocuments(documentService.getDocuments(currentUser.id));
      setSelectedDocumentId(updated.id);
      setCurrentPage("document-details");
      return;
    }
    await documentService.createDocument(currentUser.id, formData, file);
    setDocuments(documentService.getDocuments(currentUser.id));
    setCurrentPage("documents");
  }

  function editSelectedDocument() {
    setCurrentPage("document-form");
    window.scrollTo(0, 0);
  }

  function renderPage() {
    if (!currentUser) {
      if (currentPage === "login") return <LoginPage onLogin={enterApplication} onNavigate={navigate} />;
      if (currentPage === "register") return <RegisterPage onRegister={enterApplication} onNavigate={navigate} />;
      return <HomePage onNavigate={navigate} />;
    }

    if (currentUser.role === "institution") {
      return <InstitutionDashboardPage user={currentUser} />;
    }

    if (currentUser.role === "agent") {
      if (currentPage === "job-form") {
        return <JobFormPage user={currentUser} onJobsChange={setJobs} onNavigate={navigate} />;
      }
      if (currentPage === "agent-assessments") {
        return <AgentAssessmentsPage user={currentUser} jobs={jobs} applications={applications} onApplicationsChange={setApplications} onNavigate={navigate} />;
      }
      return <AgentDashboardPage user={currentUser} jobs={jobs} applications={applications} onNavigate={navigate} />;
    }

    switch (currentPage) {
      case "profile":
        return <ProfilePage user={currentUser} onUserChange={setCurrentUser} onBack={() => navigate("dashboard")} />;
      case "documents":
        return <DocumentsPage documents={documents} onNavigate={navigate} onSelectDocument={setSelectedDocumentId} />;
      case "document-form":
        return <DocumentFormPage document={selectedDocument} onSave={saveDocument} onCancel={() => navigate(selectedDocument ? "document-details" : "dashboard")} />;
      case "document-details":
        return <DocumentDetailsPage document={selectedDocument} onNavigate={navigate} onEdit={editSelectedDocument} />;
      case "verification":
        return <VerificationPage documents={documents} onNavigate={navigate} />;
      case "sharing":
        return <SharingPage user={currentUser} documents={documents} grants={grants} onGrantsChange={setGrants} onNavigate={navigate} />;
      case "jobs":
        return <CandidateJobsPage user={currentUser} jobs={jobs.filter((job) => job.active)} documents={documents} applications={applications.filter((application) => application.candidateId === currentUser.id)} onApplicationsChange={setApplications} onNavigate={navigate} />;
      default:
        return <DashboardPage user={currentUser} documents={documents} grants={grants} onNavigate={navigate} />;
    }
  }

  return (
    <div className="app">
      <Header currentUser={currentUser} onNavigate={navigate} onLogout={logout} />
      {renderPage()}
    </div>
  );
}
