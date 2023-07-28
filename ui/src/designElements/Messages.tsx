import {ReactElement} from 'react';

interface IProps {
  children: ReactElement | string;
}

export function SuccessMessage({children}: IProps): ReactElement {
  return (
    <div className="my-4 p-2 rounded bg-green-500 text-white text-center">
      {children}
    </div>
  );
}

export function InfoMessage({children}: IProps): ReactElement {
  return (
    <div className="my-4 p-2 rounded bg-cyan-500 text-white text-center">
      {children}
    </div>
  );
}

export function ErrorMessage({children}: IProps):ReactElement{
  return (
    <div className="my-4 p-2 rounded bg-red-500 text-white text-center">
      {children}
    </div>
  );
}