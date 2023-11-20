import styles from "../components/salesGPTExplanation.module.scss";
import Locale from "../../locales";

function SalesGPTExplanation() {
  return (
    <div className={styles["explanation"]}>
      <div className={styles["content-box"]}>
        <span className={styles["text"] + ` ` + styles["title"]}>
          {Locale.SalesGPT.EmployeeCVSummary.Explanation.Title}
        </span>
        <div>
          <div className={styles["list-title"]}>
            {Locale.SalesGPT.EmployeeCVSummary.Explanation.ListTitle}
          </div>
          <div className={styles["list"]}>
            <div className={styles["item"]}>
              <span className={styles["emoji"]}>💁‍♀️</span>
              <span>{Locale.SalesGPT.EmployeeCVSummary.Explanation.First}</span>
            </div>
            <div className={styles["item"]}>
              <span className={styles["emoji"]}>📋</span>
              <span>
                {Locale.SalesGPT.EmployeeCVSummary.Explanation.Second}
              </span>
            </div>
            <div className={styles["item"]}>
              <span className={styles["emoji"]}>🤖</span>
              <span>{Locale.SalesGPT.EmployeeCVSummary.Explanation.Third}</span>
            </div>
            <div className={styles["item"]}>
              <span className={styles["emoji"]}>📝</span>
              <span>
                {Locale.SalesGPT.EmployeeCVSummary.Explanation.Fourth}
              </span>
            </div>
            <div className={styles["item"]}>
              <span>
                {Locale.SalesGPT.EmployeeCVSummary.Explanation.AfterNote}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesGPTExplanation;
