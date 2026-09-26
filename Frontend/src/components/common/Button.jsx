export default function Button({ children, variant = "primary", ...p }) {
  return (
    <button className={"btn " + variant} {...p}>
      {children}
    </button>
  );
}
