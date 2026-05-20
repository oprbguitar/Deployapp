export function Timeline() {
  const items = [
    'Alianza de las Cuatro Grandes Razas',
    'Dominio Goa’uld en Vía Láctea',
    'Apertura del programa Stargate de la Tierra',
    'Caída progresiva de Señores del Sistema',
    'Guerra Ori',
    'Era post-Goa’uld y auge Lucian Alliance'
  ];

  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
