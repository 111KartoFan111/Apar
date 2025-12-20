import cls from "./Button.module.css";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export function Button({ variant = "primary", loading, iconLeft, iconRight, children, className, ...rest }: Props) {
  return (
    <button className={clsx(cls.root, cls[variant], loading && cls.loading, className)} {...rest}>
      {loading && <span className={cls.spinner} aria-hidden />}
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
