import AuthorizeAdmin from "./components/AuthorizeAdmins.tsx";

function Reports() {
  return null;
}

function ReportsPage() {
  return (
    <AuthorizeAdmin>
      <Reports />
    </AuthorizeAdmin>
  );
}

export default ReportsPage;
