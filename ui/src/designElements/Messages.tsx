import {ReactElement} from 'react';

interface IProps {
  children: ReactElement | string;
}

const messageClasses = (color: string): string => `my-4 p-2 rounded bg-${color}-500 text-white text-center`;

export const SuccessMessage = ({children}: IProps): ReactElement => <div className={messageClasses('green')}>{children}</div>;

export const InfoMessage = ({children}: IProps): ReactElement => <div className={messageClasses('cyan')}>{children}</div>;

export const ErrorMessage = ({children}: IProps): ReactElement => <div className={messageClasses('red')}>{children}</div>;