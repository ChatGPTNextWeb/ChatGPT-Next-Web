import React from "react";
import { IconButton } from "./button";
import GithubIcon from "../icons/github.svg";
import ResetIcon from "../icons/reload.svg";
import { ISSUE_URL, StoreKey } from "../constant";
import Locale from "../locales";
import { downloadAs } from "../utils";

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Update state with error details
    this.setState({ hasError: true, error, info });
  }

  clearAndSaveData() {
    const snapshot: Record<string, any> = {};
    Object.values(StoreKey).forEach((key) => {
      snapshot[key] = localStorage.getItem(key);

      if (snapshot[key]) {
        try {
          snapshot[key] = JSON.parse(snapshot[key]);
        } catch {}
      }
    });

    try {
      downloadAs(JSON.stringify(snapshot), "chatgpt-next-web-snapshot.json");
    } catch {}

    localStorage.clear();
  }

  render() {
    if (this.state.hasError) {
      // Render error message
      return (
        <div className="error">
          <h2>Oops, something went wrong!</h2>
          <pre>
            <code>{this.state.error?.toString()}</code>
            <code>{this.state.info?.componentStack}</code>
          </pre>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <a href={ISSUE_URL} className="report">
              <IconButton
                text="Report This Error"
                icon={<GithubIcon />}
                bordered
              />
            </a>
            <IconButton
              icon={<ResetIcon />}
              text="Clear All Data"
              onClick={() =>
                confirm(Locale.Store.ConfirmClearAll) && this.clearAndSaveData()
              }
              bordered
            />
          </div>
        </div>
      );
    }
    // if no error occurred, render children
    return this.props.children;
  }
}
