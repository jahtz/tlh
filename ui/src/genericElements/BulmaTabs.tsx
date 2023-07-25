import {JSX, useState} from 'react';
import classNames from 'classnames';

export interface Tabs {
  [key: string]: {
    name: string;
    render: () => JSX.Element;
  };
}

interface IProps {
  tabs: Tabs;
}

export function BulmaTabs({tabs}: IProps): JSX.Element {

  const [activeTabId, setActiveTabId] = useState<keyof Tabs>(Object.keys(tabs)[0]);

  return (
    <>
      <div className="flex mb-2">
        {Object.entries(tabs).map(([id, {name}]) =>
          <button type="button" key={id} onClick={() => setActiveTabId(id)}
                  className={classNames('p-2 flex-grow rounded-t', activeTabId === id ? ['bg-slate-400', 'text-white'] : ['border', 'border-slate-300'])}>
            {name}
          </button>
        )}
      </div>
      {tabs[activeTabId].render()}
    </>
  );
}