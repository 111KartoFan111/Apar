import clsx from "clsx";
import styles from "./Table.module.css";

type Props = {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  zebra?: boolean;
};

export function Table({ headers, rows, zebra }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={clsx(styles.table, zebra && styles.zebra)}>
        <thead>
          <tr>
            {headers.map((h, idx) => (
              <th key={idx}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
