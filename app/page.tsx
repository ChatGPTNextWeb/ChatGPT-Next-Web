import { Analytics } from "@vercel/analytics/react";
import { Home } from './components/home'

export default function App() {
  return (
    <>
      <Home />
      <Analytics />
    </>
  );
}
