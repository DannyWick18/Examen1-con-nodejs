export default function AuthInput({ type, name, placeholder, value, onChange }) {
  return (
    <input
      className="auth-input"
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      autoComplete={name}
    />
  );
}
