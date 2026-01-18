import Timer from "../components/timer/Timer";
import { getFeatureById } from "../../lib/features";
import styles from "./page.module.css";

const feature = getFeatureById("timer");

export const metadata = {
  title: feature?.title || "計時器",
  description: feature?.desc || "番茄鐘 / 倒數提醒",
};

export default function TimerPage() {
  return (
    <div className={styles.featureWrapper}>
      <div className={styles.featureHeader}>
        <div className={styles.featureHeaderLeft}>
          <div className={styles.featureMeta}>
            <h2>{feature?.title || "計時器"}</h2>
            <p className={styles.muted}>{feature?.desc || "番茄鐘 / 倒數提醒"}</p>
          </div>
        </div>
      </div>
      <div className={`${styles.featureBodyShell} ${styles.featureBodyFlat}`}>
        <Timer />
      </div>
    </div>
  );
}
