import React, {useState} from "react";
import classNames from "classnames";

export interface TabConfig {
  id: string;
  name: string;
  render: () => JSX.Element;
}

interface IProps {
  tabs: TabConfig[];
}

export function BulmaTabs({tabs}: IProps): JSX.Element {

  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  return (
    <>
      <div className="tabs is-centered">
        <ul>
          {tabs.map(({id, name}) =>
            <li className={classNames({'is-active': activeTabId === id})} key={id}>
              <a onClick={() => setActiveTabId(id)}>{name}</a>
            </li>
          )}
        </ul>
      </div>
      {tabs.find(({id}) => id === activeTabId)!.render()}
    </>
  );
}