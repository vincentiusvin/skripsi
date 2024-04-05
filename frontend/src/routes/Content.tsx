import useSWRMutation from "swr/mutation";
import Nav from "../components/Nav";
import { APIContext } from "../helpers/fetch";

function Content() {
  const { trigger: login } = useSWRMutation("/api/session", (url) =>
    new APIContext("PutSession").fetch(url, {
      method: "PUT",
      body: {
        user_name: "udin",
        user_password: "password",
      },
    })
  );

  const { trigger: logout } = useSWRMutation("/api/session", (url) =>
    new APIContext("PutSession").fetch(url, {
      method: "DELETE",
    })
  );

  return (
    <>
      <Nav />

      <br />

      <button
        onClick={() => {
          login();
        }}
      >
        Login
      </button>
      <button
        onClick={() => {
          logout();
        }}
      >
        Logout
      </button>

      <h1>Vite + React</h1>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default Content;
