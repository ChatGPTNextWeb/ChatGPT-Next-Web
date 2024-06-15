"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccessStore } from "@/app/store";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      // Update the state with the token
      useAccessStore.setState({ openaiApiKey: `${token}` });
      console.log(
        "Updated OpenAI API Key:",
        useAccessStore.getState().openaiApiKey,
      );

      // Redirect to the home page
      router.push("/");
    }
  }, [token, router]);

  // Don't render anything, just redirect
  return null;
};

export default AuthCallbackPage;

// "use client";
// import { useAccessStore } from "@/app/store";
// import { useRouter } from "next/router";
// import { useEffect } from "react";

// const AuthCallbackPage = () => {
//   const router = useRouter();
//   const { token } = router.query;

//   useEffect(() => {
//     if (token) {
//       // Update the state with the token
//       useAccessStore.setState({ openaiApiKey: `${token}` });
//       console.log(
//         "Updated OpenAI API Key:",
//         useAccessStore.getState().openaiApiKey,
//       );

//       // Update the .env file (not possible in client-side code, but you can set an env variable)
//       process.env.OPENAI_API_KEY = String(token);

//       // Redirect to the home page
//     }
//   }, [token, router]);

//   // Don't render anything, just redirect
//   return router.push("/");
// };

// export default AuthCallbackPage;
