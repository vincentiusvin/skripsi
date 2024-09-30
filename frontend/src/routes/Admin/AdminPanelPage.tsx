import AuthorizeAdmin from "./AuthorizeAdmins.tsx";

function AdminPanel() {
  return null;
}

function AdminPanelPage() {
  return (
    <AuthorizeAdmin>
      <AdminPanel />
    </AuthorizeAdmin>
  );
}

export default AdminPanelPage;
