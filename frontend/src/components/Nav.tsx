import useSWR from "swr";
import { APIContext } from "../helpers/fetch";

function Nav() {
  const { data } = useSWR("/api/session", new APIContext("GetSession").fetch);

  return (
    <>
      <div>Hello, {data?.user_name}</div>
    </>
  );
}

export default Nav;
