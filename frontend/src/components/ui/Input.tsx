import clsx from "clsx";
import styles from "./Input.module.css";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...rest }: Props) {
  return (
    <label className={styles.root}>
      {label && <span className={styles.label}>{label}</span>}
      <input className={clsx(styles.field, className)} {...rest} />
    </label>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };
export function Textarea({ label, className, ...rest }: TextareaProps) {
  return (
    <label className={styles.root}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea className={clsx(styles.field, styles.textarea, className)} {...rest} />
    </label>
  );
}
