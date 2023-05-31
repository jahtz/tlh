import {ExecutiveEditorHomeDataFragment} from './graphql';
import {JSX} from 'react';
import {Box} from './Box';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {approveDocumentUrl} from './urls';

const linkClasses = 'p-2 rounded bg-amber-500 text-white text-center w-full';

export function ExecutiveEditorHomeBox({documentsAwaitingApproval}: ExecutiveEditorHomeDataFragment): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <Box heading={t('approvalAppointments')}>
      <>
        {documentsAwaitingApproval.length > 0
          ? (
            <section className="p-2 grid grid-cols-4 gap-2">
              {documentsAwaitingApproval.map((document) =>
                <Link key={document} className={linkClasses} to={`/manuscripts/${encodeURIComponent(document)}/${approveDocumentUrl}`}>
                  {document}: {t('goToApprove')}
                </Link>)}
            </section>
          )
          : <div className="text-cyan-500 italic text-center">{t('noAppointments')}</div>}
        {/*JSON.stringify(documentsAwaitingApproval)*/}
      </>
    </Box>
  );
}