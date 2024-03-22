// mark as client component
"use client";

// importing necessary functions
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <p>Welcome {session.user?.name}. Signed In As</p>
        <p>{session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      <p>Not Signed In</p>
      <button onClick={() => signIn("facebook")}>Sign in with facebook</button>
    </>
  );
}
