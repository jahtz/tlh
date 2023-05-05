interface IProps {
  heading: string;
  children: JSX.Element;
}

export function Box({heading, children}: IProps): JSX.Element {
  return (
    <div className="my-4 p-2 rounded border border-slate-500">
      <h2 className="font-bold text-center text-xl">{heading}</h2>
      {children}
    </div>
  );
}