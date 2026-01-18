import Link from "next/link";
import { features } from "../lib/features";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main className={styles.cardsScreen}>
      <div className={styles.header}>
        <p className={styles.subtitle}>您的應用程式</p>
      </div>
      <div className={styles.cardsGrid}>
        {features.map((feature) =>
          feature.available ? (
            <Link
              key={feature.id}
              href={`/${feature.id}`}
              className={styles.featureCard}
              style={{ color: feature.accent }}
            >
              <div className={styles.featureIcon} style={{ color: feature.accent }}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {feature.iconPaths.map((d, idx) => (
                    <path key={idx} d={d} />
                  ))}
                </svg>
              </div>
              <div className={styles.featureBody}>
                <h2>{feature.title}</h2>
                <p>{feature.desc}</p>
              </div>
            </Link>
          ) : (
            <div
              key={feature.id}
              className={`${styles.featureCard} ${styles.disabled}`}
              style={{ color: feature.accent }}
              aria-disabled="true"
            >
              <div className={styles.featureIcon} style={{ color: feature.accent }}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {feature.iconPaths.map((d, idx) => (
                    <path key={idx} d={d} />
                  ))}
                </svg>
              </div>
              <div className={styles.featureBody}>
                <h2>{feature.title}</h2>
                <p>{feature.desc}</p>
                <span className={styles.featureCta}>即將推出</span>
              </div>
            </div>
          ),
        )}
      </div>
    </main>
  );
}
