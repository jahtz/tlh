import {JSX} from 'react';
import {Box} from './Box';
import {useTranslation} from 'react-i18next';
import {AppointmentType, ReviewerHomeDataFragment} from './graphql';
import {Link} from 'react-router-dom';
import {firstXmlReviewUrl, secondXmlReviewUrl, transliterationReviewUrl, xmlConversionUrl} from './urls';

const buttonClasses = 'p-2 rounded bg-amber-500 text-white text-center w-full disabled:opacity-50';

const url = (manuscriptIdentifier: string, appointmentType: AppointmentType): string => {
  const typeUrlFragment = {
    [AppointmentType.TransliterationReview]: transliterationReviewUrl,
    [AppointmentType.XmlConversion]: xmlConversionUrl,
    [AppointmentType.FirstXmlReview]: firstXmlReviewUrl,
    [AppointmentType.SecondXmlReview]: secondXmlReviewUrl,
  }[appointmentType];

  return `/manuscripts/${encodeURIComponent(manuscriptIdentifier)}/${typeUrlFragment}`;
};

export function ReviewerHomeBox({appointments}: ReviewerHomeDataFragment): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <Box heading={t('myReviewAppointments')}>
      {appointments.length > 0
        ? (
          <section className="p-2 grid grid-cols-4 gap-2">
            {appointments.map(({manuscriptIdentifier, type, waitingFor}) =>
              waitingFor
                ? (
                  <button key={`${manuscriptIdentifier}_${type}`} className={buttonClasses} disabled
                          title={t('notPerformed_{{waitingFor}}', {waitingFor}) || undefined}>
                    {manuscriptIdentifier} - {type}
                  </button>
                )
                : (
                  <Link key={`${manuscriptIdentifier}_${type}`} className={buttonClasses} to={url(manuscriptIdentifier, type)}>
                    {manuscriptIdentifier} - {type}
                  </Link>
                )
            )}
          </section>
        )
        : <div className="text-cyan-500 italic text-center">{t('noAppointments')}</div>}
    </Box>
  );
}