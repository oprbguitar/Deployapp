interface Props {
  category: string;
  categories: string[];
  series: string;
  seriesList: string[];
  onCategory: (value: string) => void;
  onSeries: (value: string) => void;
}

export function FilterPanel({
  category,
  categories,
  series,
  seriesList,
  onCategory,
  onSeries
}: Props) {
  return (
    <div className="filterPanel">
      <label>
        Tipo
        <select value={category} onChange={(e) => onCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        Serie
        <select value={series} onChange={(e) => onSeries(e.target.value)}>
          {seriesList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
