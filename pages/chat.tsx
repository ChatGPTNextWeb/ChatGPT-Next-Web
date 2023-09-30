import { signIn, signOut, useSession } from "next-auth/react"
import { Home } from "../app/components/home";
import Locale from "../app/locales";

import "../app/styles/globals.scss";
import "../app/styles/markdown.scss";
import "../app/styles/highlight.scss";

export default function Chat() {
    const { data: session, status } = useSession()

    if(status === 'loading'){
        return (
            <>
                Loading...
            </>
        ) 
    }

    if (session) {
        return (
            <>
                    <Home />
            </>
        )
    }
    return (

        <>
        <style jsx>{`
        button {
            background-color: white;
            border: 1px solid #eaeaea;
            font-size: 1.5rem;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
            hover: {
                
            }
        }
        
        button:hover {
            background-color:#eaeaea;
            transition: 0.7s;
            cursor: pointer;
        }
      `}</style>
            <h2>{Locale.Home.LoginMessage}</h2>
            <center><button onClick={() => signIn('okta')}>{Locale.Home.Login}</button></center>
        </>
    )
}