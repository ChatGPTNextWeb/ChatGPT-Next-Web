import { Home } from "./components/home";
import { redirect } from 'next/navigation'
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  redirect("/chat")
}
