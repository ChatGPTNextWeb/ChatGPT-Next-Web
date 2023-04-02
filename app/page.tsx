import { Analytics } from "@vercel/analytics/react";

import "array.prototype.at";

import { Home } from "./components/home";

export default function App() {
  return (
    <>
      <Home />
      <Analytics />
    </>
  );
}
