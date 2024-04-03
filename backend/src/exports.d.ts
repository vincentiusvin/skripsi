import { getTest } from "./routes/test"
import { postTest } from "./routes/test2"

export type API = {
    "POST /api/test": typeof postTest
    "GET /api/test": typeof getTest
}
