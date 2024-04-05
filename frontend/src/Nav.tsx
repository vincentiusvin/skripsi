import useSWR from "swr";
import { APIContext } from "./helper";

function Nav() {
  const { data, error } = useSWR(
    "/api/session",
    new APIContext("GetSession").fetch
  );

  return (
    <>
      <div>Hello, {data?.user_name}</div>
      <br />
      <button onClick={() => setCount((count) => count + 1)}>Login</button>
      <button onClick={() => setCount((count) => count + 1)}>Logout</button>
    </>
  );
}

export default Nav;
