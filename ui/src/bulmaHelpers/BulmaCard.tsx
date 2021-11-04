interface IProps {
  title: string;
  children: JSX.Element;
}

export function BulmaCard({title, children}: IProps): JSX.Element {
  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">{title}</p>
      </header>
      <div className="card-content">{children}</div>
    </div>
  );
}