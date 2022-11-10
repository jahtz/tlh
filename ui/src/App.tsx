import {Outlet} from 'react-router-dom';
import {NavBar} from './NavBar';

export function App(): JSX.Element {

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <NavBar/>

      <div className="p-2 h-full max-h-full flex-auto">
        <Outlet/>
      </div>
    </div>
  );
}
