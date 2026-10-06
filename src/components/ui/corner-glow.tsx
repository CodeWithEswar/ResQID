import styles from "./corner-glow.module.css";

export function CornerGlow() {
  return (
    <>
      <div aria-hidden="true" className={`${styles.cornerDots} ${styles.topLeft}`} />
      <div aria-hidden="true" className={`${styles.cornerDots} ${styles.bottomRight}`} />
    </>
  );
}
