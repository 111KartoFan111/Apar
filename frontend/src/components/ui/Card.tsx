import clsx from "clsx";
import styles from "./Card.module.css";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, subtitle, children, className }: Props) {
  return (
    <div className={clsx(styles.root, className)}>
      {title && <div className={styles.title}>{title}</div>}
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      {children}
    </div>
  );
}
