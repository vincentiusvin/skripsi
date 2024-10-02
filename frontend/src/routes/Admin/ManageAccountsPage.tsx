import AuthorizeAdmin from "./components/AuthorizeAdmins.tsx";

function ManageAccounts() {
  return null;
}

function ManageAccountsPage() {
  return (
    <AuthorizeAdmin>
      <ManageAccounts />
    </AuthorizeAdmin>
  );
}

export default ManageAccountsPage;
