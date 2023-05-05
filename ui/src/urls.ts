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

// Fragments

export const manuscriptsUrlFragment = 'manuscripts';

export const uploadPicturesUrl = 'uploadPictures';

export const createTransliterationUrl = 'createTransliteration';

export const reviewTransliterationUrl = 'reviewTransliteration';

// Foreign urls

export const tlhAnalyzerUrl = '/TLHaly/jasonanalysis.php';
