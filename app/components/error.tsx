import React from "react";
import { IconButton } from "./button";
import GithubIcon from "../icons/github.svg";
import ResetIcon from "../icons/reload.svg";
import { ISSUE_URL } from "../constant";
import Locale from "../locales";
import { showConfirm } from "./ui-lib";
import { useSyncStore } from "../store/sync";
import { logErrorToServer } from "./logging"; // Add a logging utility

interface IErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    // Log the error to a server or service
    logErrorToServer(error);

    // Set the state to indicate that an error occurred
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // Render an error message and options
      return (
        <div className="error">
          <h2>Oops, something went wrong!</h2>
          <p>We apologize for the inconvenience. Please try refreshing the page.</p>
          <a href={ISSUE_URL} className="report">
            <IconButton text="Report This Error" icon={<GithubIcon />} bordered />
          </a>
          <IconButton
            icon={<ResetIcon />}
            text="Refresh Page"
            onClick={() => window.location.reload()}
            bordered
          />
        </div>
      );
    }

    // If no error occurred, render children
    return this.props.children;
  }
}
