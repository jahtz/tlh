import {Link} from 'react-router-dom';

interface IProps {
  manuscripts: string[];
  errorMsg: string;
}

export function ManuscriptLinkButtons({manuscripts, errorMsg}: IProps): JSX.Element {
  return manuscripts.length > 0
    ? (
      <div className="grid grid-cols-6 gap-2">
        {manuscripts.map((myManuscript) =>
          <Link key={myManuscript} to={`/manuscripts/${encodeURIComponent(myManuscript)}/data`} className="p-2 rounded bg-blue-500 text-white text-center">
            {myManuscript}
          </Link>)}
      </div>
    )
    : <p className="italic text-cyan-500 text-center">{errorMsg}</p>;
}