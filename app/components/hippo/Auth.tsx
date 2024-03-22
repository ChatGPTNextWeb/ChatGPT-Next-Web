// mark as client component
"use client";

// importing necessary functions
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  // extracting data from usesession as session
  const { data: session } = useSession();

  // checking if sessions exists
  if (session) {
    // rendering components for logged in users
    return (
      <>
        <p>Welcome {session.user?.name}. Signed In As</p>
        <p>{session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  // rendering components for not logged in users
  return (
    <>
      <p>Not Signed In</p>
      <button onClick={() => signIn("facebook")}>Sign in with facebook</button>
      <button onClick={() => signIn("github")}>Sign in with github</button>
    </>
  );
}
