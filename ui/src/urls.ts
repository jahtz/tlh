export function pictureBaseUrl(manuscriptMainIdentifier: string): string {
  return `${process.env.REACT_APP_SERVER_URL}/uploads/${manuscriptMainIdentifier}`;
}

export const homeUrl = '/';

export const createManuscriptUrl = '/createManuscript';

export const registerUrl = '/registerForm';
export const loginUrl = '/login';

export const preferencesUrl = '/preferences';

export const editTransliterationDocumentUrl = '/editDocument';
export const editTranscriptionDocumentUrl = '/transcriptioEditDocument';

export const xmlComparatorUrl = '/xmlComparator';

export const documentMergerUrl = '/documentMerger';

export const userManagementUrl = '/userManagement';

export const pipelineManagementUrl = '/pipelineManagement';

// Fragments

export const manuscriptsUrlFragment = 'manuscripts';

export const uploadPicturesUrl = 'uploadPictures';

export const createTransliterationUrl = 'createTransliteration';

export const transliterationReviewUrl = 'transliterationReview';

export const xmlConversionUrl = 'xmlConversion';

export const firstXmlReviewUrl = 'firstXmlReview';

export const secondXmlReviewUrl = 'secondXmlReview';

export const approveDocumentUrl = 'approveDocument';

// Foreign urls

export const tlhAnalyzerUrl = '/TLHaly/jasonanalysis.php';
