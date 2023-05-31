import {Outlet} from 'react-router-dom';
import {NavBar} from './NavBar';
import {JSX} from 'react';

export function App(): JSX.Element {
  return (
    <div className="flex flex-col h-screen max-h-screen">
      <NavBar/>

      <div className="p-4 h-full max-h-full flex-auto">
        <Outlet/>
      </div>
    </div>
  );
}
