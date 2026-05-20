interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <label className="searchBar">
      <span>Buscar</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="nombre, episodio, planeta, tecnología o facción"
        aria-label="Buscar en fichas"
      />
    </label>
  );
}
