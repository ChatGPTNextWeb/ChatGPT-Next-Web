import { Home } from "./components/home";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <>
      <Home />
      <Analytics />
    </>
  );
}
