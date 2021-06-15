import React, {useState} from 'react';
import classNames from 'classnames';

export interface Tabs {
  [key: string]: {
    name: string;
    render: () => JSX.Element;
  }
}

interface IProps {
  tabs: Tabs;
}

export function BulmaTabs({tabs}: IProps): JSX.Element {

  const [activeTabId, setActiveTabId] = useState<keyof Tabs>(Object.keys(tabs)[0]);

  return (
    <>
      <div className="tabs is-centered">
        <ul>
          {Object.entries(tabs).map(([id, {name}]) =>
            <li className={classNames({'is-active': activeTabId === id})} key={id}>
              <a onClick={() => setActiveTabId(id)}>{name}</a>
            </li>
          )}
        </ul>
      </div>
      {tabs[activeTabId].render()}
    </>
  );
}