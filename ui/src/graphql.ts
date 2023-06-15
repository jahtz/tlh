import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string | number; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Appointment = {
  __typename?: 'Appointment';
  manuscriptIdentifier: Scalars['String']['output'];
  type: AppointmentType;
  waitingFor?: Maybe<AppointmentType>;
};

export const enum AppointmentType {
  FirstXmlReview = 'FirstXmlReview',
  SecondXmlReview = 'SecondXmlReview',
  TransliterationReview = 'TransliterationReview',
  XmlConversion = 'XmlConversion'
};

export type DocumentInPipeline = {
  __typename?: 'DocumentInPipeline';
  appointedFirstXmlReviewer?: Maybe<Scalars['String']['output']>;
  appointedSecondXmlReviewer?: Maybe<Scalars['String']['output']>;
  appointedTransliterationReviewer?: Maybe<Scalars['String']['output']>;
  appointedXmlConverter?: Maybe<Scalars['String']['output']>;
  approvalDateString?: Maybe<Scalars['String']['output']>;
  firstXmlReviewDateString?: Maybe<Scalars['String']['output']>;
  manuscriptIdentifier: Scalars['String']['output'];
  secondXmlReviewDateString?: Maybe<Scalars['String']['output']>;
  transliterationReviewDateString?: Maybe<Scalars['String']['output']>;
  xmlConversionDateString?: Maybe<Scalars['String']['output']>;
};

export type ExecutiveEditor = {
  __typename?: 'ExecutiveEditor';
  allReviewers: Array<Scalars['String']['output']>;
  documentAwaitingApproval?: Maybe<Scalars['String']['output']>;
  documentsAwaitingApproval: Array<Scalars['String']['output']>;
  documentsInPipeline: Array<DocumentInPipeline>;
  documentsInPipelineCount: Scalars['Int']['output'];
  userCount: Scalars['Int']['output'];
  users: Array<User>;
};


export type ExecutiveEditorDocumentAwaitingApprovalArgs = {
  mainIdentifier: Scalars['String']['input'];
};


export type ExecutiveEditorDocumentsInPipelineArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type ExecutiveEditorUsersArgs = {
  page: Scalars['Int']['input'];
};

export type ExecutiveEditorMutations = {
  __typename?: 'ExecutiveEditorMutations';
  appointFirstXmlReviewer: Scalars['String']['output'];
  appointSecondXmlReviewer: Scalars['String']['output'];
  appointTransliterationReviewer: Scalars['String']['output'];
  appointXmlConverter: Scalars['String']['output'];
  submitApproval: Scalars['Boolean']['output'];
  updateUserRights: Rights;
};


export type ExecutiveEditorMutationsAppointFirstXmlReviewerArgs = {
  manuscriptIdentifier: Scalars['String']['input'];
  reviewer: Scalars['String']['input'];
};


export type ExecutiveEditorMutationsAppointSecondXmlReviewerArgs = {
  manuscriptIdentifier: Scalars['String']['input'];
  reviewer: Scalars['String']['input'];
};


export type ExecutiveEditorMutationsAppointTransliterationReviewerArgs = {
  manuscriptIdentifier: Scalars['String']['input'];
  reviewer: Scalars['String']['input'];
};


export type ExecutiveEditorMutationsAppointXmlConverterArgs = {
  converter: Scalars['String']['input'];
  manuscriptIdentifier: Scalars['String']['input'];
};


export type ExecutiveEditorMutationsSubmitApprovalArgs = {
  input: Scalars['String']['input'];
  manuscriptIdentifier: Scalars['String']['input'];
};


export type ExecutiveEditorMutationsUpdateUserRightsArgs = {
  newRights: Rights;
  username: Scalars['String']['input'];
};

export type LoggedInUserMutations = {
  __typename?: 'LoggedInUserMutations';
  createManuscript: Scalars['String']['output'];
  manuscript?: Maybe<ManuscriptMutations>;
};


export type LoggedInUserMutationsCreateManuscriptArgs = {
  values?: InputMaybe<ManuscriptMetaDataInput>;
};


export type LoggedInUserMutationsManuscriptArgs = {
  mainIdentifier: Scalars['String']['input'];
};

export type ManuscriptIdentifier = {
  __typename?: 'ManuscriptIdentifier';
  identifier: Scalars['String']['output'];
  identifierType: ManuscriptIdentifierType;
};

export type ManuscriptIdentifierInput = {
  identifier: Scalars['String']['input'];
  identifierType: ManuscriptIdentifierType;
};

export const enum ManuscriptIdentifierType {
  CollectionNumber = 'CollectionNumber',
  ExcavationNumber = 'ExcavationNumber',
  PublicationShortReference = 'PublicationShortReference'
};

export const enum ManuscriptLanguageAbbreviations {
  Akk = 'Akk',
  Hat = 'Hat',
  Hit = 'Hit',
  Hur = 'Hur',
  Luw = 'Luw',
  Pal = 'Pal',
  Sum = 'Sum'
};

export type ManuscriptMetaData = {
  __typename?: 'ManuscriptMetaData';
  bibliography?: Maybe<Scalars['String']['output']>;
  creatorUsername: Scalars['String']['output'];
  cthClassification?: Maybe<Scalars['Int']['output']>;
  defaultLanguage: ManuscriptLanguageAbbreviations;
  mainIdentifier: ManuscriptIdentifier;
  otherIdentifiers: Array<ManuscriptIdentifier>;
  palaeographicClassification: PalaeographicClassification;
  palaeographicClassificationSure: Scalars['Boolean']['output'];
  pictureUrls: Array<Scalars['String']['output']>;
  provenance?: Maybe<Scalars['String']['output']>;
  provisionalTransliteration?: Maybe<Scalars['String']['output']>;
  status?: Maybe<ManuscriptStatus>;
  transliterationReleased: Scalars['Boolean']['output'];
};

export type ManuscriptMetaDataInput = {
  bibliography?: InputMaybe<Scalars['String']['input']>;
  cthClassification?: InputMaybe<Scalars['Int']['input']>;
  defaultLanguage: ManuscriptLanguageAbbreviations;
  mainIdentifier: ManuscriptIdentifierInput;
  otherIdentifiers: Array<ManuscriptIdentifierInput>;
  palaeographicClassification: PalaeographicClassification;
  palaeographicClassificationSure: Scalars['Boolean']['input'];
  provenance?: InputMaybe<Scalars['String']['input']>;
};

export type ManuscriptMutations = {
  __typename?: 'ManuscriptMutations';
  releaseTransliteration: Scalars['Boolean']['output'];
  updateTransliteration: Scalars['Boolean']['output'];
};


export type ManuscriptMutationsUpdateTransliterationArgs = {
  input: Scalars['String']['input'];
};

export const enum ManuscriptStatus {
  Approved = 'Approved',
  Created = 'Created',
  FirstXmlReviewPerformed = 'FirstXmlReviewPerformed',
  SecondXmlReviewPerformed = 'SecondXmlReviewPerformed',
  TransliterationReleased = 'TransliterationReleased',
  TransliterationReviewPerformed = 'TransliterationReviewPerformed',
  XmlConversionPerformed = 'XmlConversionPerformed'
};

export type Mutation = {
  __typename?: 'Mutation';
  executiveEditor?: Maybe<ExecutiveEditorMutations>;
  login?: Maybe<Scalars['String']['output']>;
  me?: Maybe<LoggedInUserMutations>;
  register?: Maybe<Scalars['String']['output']>;
  reviewerMutations?: Maybe<ReviewerMutations>;
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  userInput: UserInput;
};

export const enum PalaeographicClassification {
  AssyroMittanianScript = 'AssyroMittanianScript',
  LateNewScript = 'LateNewScript',
  MiddleAssyrianScript = 'MiddleAssyrianScript',
  MiddleBabylonianScript = 'MiddleBabylonianScript',
  MiddleScript = 'MiddleScript',
  NewScript = 'NewScript',
  OldAssyrianScript = 'OldAssyrianScript',
  OldScript = 'OldScript',
  Unclassified = 'Unclassified'
};

export type Query = {
  __typename?: 'Query';
  allManuscripts: Array<ManuscriptMetaData>;
  executiveEditorQueries?: Maybe<ExecutiveEditor>;
  manuscript?: Maybe<ManuscriptMetaData>;
  manuscriptCount: Scalars['Int']['output'];
  myManuscripts?: Maybe<Array<Scalars['String']['output']>>;
  reviewerQueries?: Maybe<Reviewer>;
};


export type QueryAllManuscriptsArgs = {
  page: Scalars['Int']['input'];
};


export type QueryManuscriptArgs = {
  mainIdentifier: Scalars['String']['input'];
};

export type Reviewer = {
  __typename?: 'Reviewer';
  appointments: Array<Appointment>;
  transliterationReview?: Maybe<Scalars['String']['output']>;
  xmlConversion?: Maybe<Scalars['String']['output']>;
  xmlReview?: Maybe<Scalars['String']['output']>;
};


export type ReviewerTransliterationReviewArgs = {
  mainIdentifier: Scalars['String']['input'];
};


export type ReviewerXmlConversionArgs = {
  mainIdentifier: Scalars['String']['input'];
};


export type ReviewerXmlReviewArgs = {
  mainIdentifier: Scalars['String']['input'];
  reviewType: XmlReviewType;
};

export type ReviewerMutations = {
  __typename?: 'ReviewerMutations';
  submitTransliterationReview: Scalars['Boolean']['output'];
  submitXmlConversion: Scalars['Boolean']['output'];
  submitXmlReview: Scalars['Boolean']['output'];
};


export type ReviewerMutationsSubmitTransliterationReviewArgs = {
  mainIdentifier: Scalars['String']['input'];
  review: Scalars['String']['input'];
};


export type ReviewerMutationsSubmitXmlConversionArgs = {
  conversion: Scalars['String']['input'];
  mainIdentifier: Scalars['String']['input'];
};


export type ReviewerMutationsSubmitXmlReviewArgs = {
  mainIdentifier: Scalars['String']['input'];
  review: Scalars['String']['input'];
  reviewType: XmlReviewType;
};

export const enum Rights {
  Author = 'Author',
  ExecutiveEditor = 'ExecutiveEditor',
  Reviewer = 'Reviewer'
};

export type User = {
  __typename?: 'User';
  affiliation?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rights: Rights;
  username: Scalars['String']['output'];
};

export type UserInput = {
  affiliation?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordRepeat: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export const enum XmlReviewType {
  FirstXmlReview = 'FirstXmlReview',
  SecondXmlReview = 'SecondXmlReview'
};

export type ManuscriptIdentifierFragment = { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string };

export type ManuscriptBasicDataFragment = { __typename?: 'ManuscriptMetaData', status?: ManuscriptStatus | null, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } };

export type ReviewerHomeDataFragment = { __typename?: 'Reviewer', appointments: Array<{ __typename?: 'Appointment', type: AppointmentType, manuscriptIdentifier: string, waitingFor?: AppointmentType | null }> };

export type ExecutiveEditorHomeDataFragment = { __typename?: 'ExecutiveEditor', documentsAwaitingApproval: Array<string> };

export type IndexQueryVariables = Exact<{
  page?: Scalars['Int']['input'];
}>;


export type IndexQuery = { __typename?: 'Query', manuscriptCount: number, myManuscripts?: Array<string> | null, allManuscripts: Array<{ __typename?: 'ManuscriptMetaData', status?: ManuscriptStatus | null, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } }>, reviewerQueries?: { __typename?: 'Reviewer', appointments: Array<{ __typename?: 'Appointment', type: AppointmentType, manuscriptIdentifier: string, waitingFor?: AppointmentType | null }> } | null, executiveEditorQueries?: { __typename?: 'ExecutiveEditor', documentsAwaitingApproval: Array<string> } | null };

export type CreateManuscriptMutationVariables = Exact<{
  manuscriptMetaData?: InputMaybe<ManuscriptMetaDataInput>;
}>;


export type CreateManuscriptMutation = { __typename?: 'Mutation', me?: { __typename?: 'LoggedInUserMutations', identifier: string } | null };

export type ManuscriptMetaDataFragment = { __typename?: 'ManuscriptMetaData', defaultLanguage: ManuscriptLanguageAbbreviations, bibliography?: string | null, cthClassification?: number | null, palaeographicClassification: PalaeographicClassification, palaeographicClassificationSure: boolean, provenance?: string | null, creatorUsername: string, pictureUrls: Array<string>, provisionalTransliteration?: string | null, transliterationReleased: boolean, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }, otherIdentifiers: Array<{ __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }> };

export type ManuscriptQueryVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
}>;


export type ManuscriptQuery = { __typename?: 'Query', manuscript?: { __typename?: 'ManuscriptMetaData', defaultLanguage: ManuscriptLanguageAbbreviations, bibliography?: string | null, cthClassification?: number | null, palaeographicClassification: PalaeographicClassification, palaeographicClassificationSure: boolean, provenance?: string | null, creatorUsername: string, pictureUrls: Array<string>, provisionalTransliteration?: string | null, transliterationReleased: boolean, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }, otherIdentifiers: Array<{ __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }> } | null };

export type ReleaseTransliterationMutationVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
}>;


export type ReleaseTransliterationMutation = { __typename?: 'Mutation', me?: { __typename?: 'LoggedInUserMutations', manuscript?: { __typename?: 'ManuscriptMutations', releaseTransliteration: boolean } | null } | null };

export type ManuscriptIdentWithCreatorFragment = { __typename?: 'ManuscriptMetaData', pictureUrls: Array<string>, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } };

export type UploadPicturesQueryVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
}>;


export type UploadPicturesQuery = { __typename?: 'Query', manuscript?: { __typename?: 'ManuscriptMetaData', pictureUrls: Array<string>, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } } | null };

export type TransliterationInputQueryVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
}>;


export type TransliterationInputQuery = { __typename?: 'Query', manuscript?: { __typename?: 'ManuscriptMetaData', mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } } | null };

export type UploadTransliterationMutationVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
  input: Scalars['String']['input'];
}>;


export type UploadTransliterationMutation = { __typename?: 'Mutation', me?: { __typename?: 'LoggedInUserMutations', manuscript?: { __typename?: 'ManuscriptMutations', updateTransliteration: boolean } | null } | null };

export type ReviewTransliterationQueryVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
}>;


export type ReviewTransliterationQuery = { __typename?: 'Query', reviewerQueries?: { __typename?: 'Reviewer', transliterationReview?: string | null } | null };

export type SubmitTransliterationReviewMutationVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
  review: Scalars['String']['input'];
}>;


export type SubmitTransliterationReviewMutation = { __typename?: 'Mutation', reviewerMutations?: { __typename?: 'ReviewerMutations', submitTransliterationReview: boolean } | null };

export type XmlConversionQueryVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
}>;


export type XmlConversionQuery = { __typename?: 'Query', reviewerQueries?: { __typename?: 'Reviewer', xmlConversion?: string | null } | null };

export type SubmitXmlConversionMutationVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
  conversion: Scalars['String']['input'];
}>;


export type SubmitXmlConversionMutation = { __typename?: 'Mutation', reviewerMutations?: { __typename?: 'ReviewerMutations', submitXmlConversion: boolean } | null };

export type XmlReviewQueryVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
  reviewType: XmlReviewType;
}>;


export type XmlReviewQuery = { __typename?: 'Query', reviewerQueries?: { __typename?: 'Reviewer', xmlReview?: string | null } | null };

export type SubmitXmlReviewMutationVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
  review: Scalars['String']['input'];
  reviewType: XmlReviewType;
}>;


export type SubmitXmlReviewMutation = { __typename?: 'Mutation', reviewerMutations?: { __typename?: 'ReviewerMutations', submitXmlReview: boolean } | null };

export type ApprovalQueryVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
}>;


export type ApprovalQuery = { __typename?: 'Query', executiveEditorQueries?: { __typename: 'ExecutiveEditor', documentAwaitingApproval?: string | null } | null };

export type SubmitApprovalMutationVariables = Exact<{
  mainIdentifier: Scalars['String']['input'];
  input: Scalars['String']['input'];
}>;


export type SubmitApprovalMutation = { __typename?: 'Mutation', executiveEditor?: { __typename?: 'ExecutiveEditorMutations', submitApproval: boolean } | null };

export type DocumentInPipelineFragment = { __typename?: 'DocumentInPipeline', manuscriptIdentifier: string, appointedTransliterationReviewer?: string | null, transliterationReviewDateString?: string | null, appointedXmlConverter?: string | null, xmlConversionDateString?: string | null, appointedFirstXmlReviewer?: string | null, firstXmlReviewDateString?: string | null, appointedSecondXmlReviewer?: string | null, secondXmlReviewDateString?: string | null };

export type PipelineOverviewFragment = { __typename?: 'ExecutiveEditor', allReviewers: Array<string>, documentsInPipeline: Array<{ __typename?: 'DocumentInPipeline', manuscriptIdentifier: string, appointedTransliterationReviewer?: string | null, transliterationReviewDateString?: string | null, appointedXmlConverter?: string | null, xmlConversionDateString?: string | null, appointedFirstXmlReviewer?: string | null, firstXmlReviewDateString?: string | null, appointedSecondXmlReviewer?: string | null, secondXmlReviewDateString?: string | null }> };

export type PipelineOverviewQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PipelineOverviewQuery = { __typename?: 'Query', executiveEditorQueries?: { __typename?: 'ExecutiveEditor', allReviewers: Array<string>, documentsInPipeline: Array<{ __typename?: 'DocumentInPipeline', manuscriptIdentifier: string, appointedTransliterationReviewer?: string | null, transliterationReviewDateString?: string | null, appointedXmlConverter?: string | null, xmlConversionDateString?: string | null, appointedFirstXmlReviewer?: string | null, firstXmlReviewDateString?: string | null, appointedSecondXmlReviewer?: string | null, secondXmlReviewDateString?: string | null }> } | null };

export type AppointTransliterationReviewerMutationVariables = Exact<{
  manuscriptIdentifier: Scalars['String']['input'];
  reviewer: Scalars['String']['input'];
}>;


export type AppointTransliterationReviewerMutation = { __typename?: 'Mutation', executiveEditor?: { __typename?: 'ExecutiveEditorMutations', appointTransliterationReviewer: string } | null };

export type AppointXmlConverterMutationVariables = Exact<{
  manuscriptIdentifier: Scalars['String']['input'];
  converter: Scalars['String']['input'];
}>;


export type AppointXmlConverterMutation = { __typename?: 'Mutation', executiveEditor?: { __typename?: 'ExecutiveEditorMutations', appointXmlConverter: string } | null };

export type AppointFirstXmlReviewerMutationVariables = Exact<{
  manuscriptIdentifier: Scalars['String']['input'];
  reviewer: Scalars['String']['input'];
}>;


export type AppointFirstXmlReviewerMutation = { __typename?: 'Mutation', executiveEditor?: { __typename?: 'ExecutiveEditorMutations', appointFirstXmlReviewer: string } | null };

export type AppointSecondXmlReviewerMutationVariables = Exact<{
  manuscriptIdentifier: Scalars['String']['input'];
  reviewer: Scalars['String']['input'];
}>;


export type AppointSecondXmlReviewerMutation = { __typename?: 'Mutation', executiveEditor?: { __typename?: 'ExecutiveEditorMutations', appointSecondXmlReviewer: string } | null };

export type RegisterMutationVariables = Exact<{
  userInput: UserInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register?: string | null };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: string | null };

export type UserFragment = { __typename?: 'User', username: string, name: string, affiliation?: string | null, email: string, rights: Rights };

export type UsersOverviewQueryVariables = Exact<{
  page: Scalars['Int']['input'];
}>;


export type UsersOverviewQuery = { __typename?: 'Query', executiveEditorQueries?: { __typename?: 'ExecutiveEditor', userCount: number, users: Array<{ __typename?: 'User', username: string, name: string, affiliation?: string | null, email: string, rights: Rights }> } | null };

export type UpdateUserRightsMutationVariables = Exact<{
  username: Scalars['String']['input'];
  newRights: Rights;
}>;


export type UpdateUserRightsMutation = { __typename?: 'Mutation', executiveEditor?: { __typename?: 'ExecutiveEditorMutations', updateUserRights: Rights } | null };

export const ManuscriptIdentifierFragmentDoc = gql`
    fragment ManuscriptIdentifier on ManuscriptIdentifier {
  identifierType
  identifier
}
    `;
export const ManuscriptBasicDataFragmentDoc = gql`
    fragment ManuscriptBasicData on ManuscriptMetaData {
  mainIdentifier {
    ...ManuscriptIdentifier
  }
  status
  creatorUsername
}
    ${ManuscriptIdentifierFragmentDoc}`;
export const ReviewerHomeDataFragmentDoc = gql`
    fragment ReviewerHomeData on Reviewer {
  appointments {
    type
    manuscriptIdentifier
    waitingFor
  }
}
    `;
export const ExecutiveEditorHomeDataFragmentDoc = gql`
    fragment ExecutiveEditorHomeData on ExecutiveEditor {
  documentsAwaitingApproval
}
    `;
export const ManuscriptMetaDataFragmentDoc = gql`
    fragment ManuscriptMetaData on ManuscriptMetaData {
  mainIdentifier {
    ...ManuscriptIdentifier
  }
  otherIdentifiers {
    ...ManuscriptIdentifier
  }
  defaultLanguage
  bibliography
  cthClassification
  palaeographicClassification
  palaeographicClassificationSure
  provenance
  creatorUsername
  pictureUrls
  provisionalTransliteration
  transliterationReleased
}
    ${ManuscriptIdentifierFragmentDoc}`;
export const ManuscriptIdentWithCreatorFragmentDoc = gql`
    fragment ManuscriptIdentWithCreator on ManuscriptMetaData {
  mainIdentifier {
    ...ManuscriptIdentifier
  }
  pictureUrls
  creatorUsername
}
    ${ManuscriptIdentifierFragmentDoc}`;
export const DocumentInPipelineFragmentDoc = gql`
    fragment DocumentInPipeline on DocumentInPipeline {
  manuscriptIdentifier
  appointedTransliterationReviewer
  transliterationReviewDateString
  appointedXmlConverter
  xmlConversionDateString
  appointedFirstXmlReviewer
  firstXmlReviewDateString
  appointedSecondXmlReviewer
  secondXmlReviewDateString
}
    `;
export const PipelineOverviewFragmentDoc = gql`
    fragment PipelineOverview on ExecutiveEditor {
  allReviewers
  documentsInPipeline(page: $page) {
    ...DocumentInPipeline
  }
}
    ${DocumentInPipelineFragmentDoc}`;
export const UserFragmentDoc = gql`
    fragment User on User {
  username
  name
  affiliation
  email
  rights
}
    `;
export const IndexDocument = gql`
    query Index($page: Int! = 0) {
  manuscriptCount
  allManuscripts(page: $page) {
    ...ManuscriptBasicData
  }
  myManuscripts
  reviewerQueries {
    ...ReviewerHomeData
  }
  executiveEditorQueries {
    ...ExecutiveEditorHomeData
  }
}
    ${ManuscriptBasicDataFragmentDoc}
${ReviewerHomeDataFragmentDoc}
${ExecutiveEditorHomeDataFragmentDoc}`;

/**
 * __useIndexQuery__
 *
 * To run a query within a React component, call `useIndexQuery` and pass it any options that fit your needs.
 * When your component renders, `useIndexQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIndexQuery({
 *   variables: {
 *      page: // value for 'page'
 *   },
 * });
 */
export function useIndexQuery(baseOptions?: Apollo.QueryHookOptions<IndexQuery, IndexQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IndexQuery, IndexQueryVariables>(IndexDocument, options);
      }
export function useIndexLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IndexQuery, IndexQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IndexQuery, IndexQueryVariables>(IndexDocument, options);
        }
export type IndexQueryHookResult = ReturnType<typeof useIndexQuery>;
export type IndexLazyQueryHookResult = ReturnType<typeof useIndexLazyQuery>;
export type IndexQueryResult = Apollo.QueryResult<IndexQuery, IndexQueryVariables>;
export const CreateManuscriptDocument = gql`
    mutation CreateManuscript($manuscriptMetaData: ManuscriptMetaDataInput) {
  me {
    identifier: createManuscript(values: $manuscriptMetaData)
  }
}
    `;
export type CreateManuscriptMutationFn = Apollo.MutationFunction<CreateManuscriptMutation, CreateManuscriptMutationVariables>;

/**
 * __useCreateManuscriptMutation__
 *
 * To run a mutation, you first call `useCreateManuscriptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateManuscriptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createManuscriptMutation, { data, loading, error }] = useCreateManuscriptMutation({
 *   variables: {
 *      manuscriptMetaData: // value for 'manuscriptMetaData'
 *   },
 * });
 */
export function useCreateManuscriptMutation(baseOptions?: Apollo.MutationHookOptions<CreateManuscriptMutation, CreateManuscriptMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateManuscriptMutation, CreateManuscriptMutationVariables>(CreateManuscriptDocument, options);
      }
export type CreateManuscriptMutationHookResult = ReturnType<typeof useCreateManuscriptMutation>;
export type CreateManuscriptMutationResult = Apollo.MutationResult<CreateManuscriptMutation>;
export type CreateManuscriptMutationOptions = Apollo.BaseMutationOptions<CreateManuscriptMutation, CreateManuscriptMutationVariables>;
export const ManuscriptDocument = gql`
    query Manuscript($mainIdentifier: String!) {
  manuscript(mainIdentifier: $mainIdentifier) {
    ...ManuscriptMetaData
  }
}
    ${ManuscriptMetaDataFragmentDoc}`;

/**
 * __useManuscriptQuery__
 *
 * To run a query within a React component, call `useManuscriptQuery` and pass it any options that fit your needs.
 * When your component renders, `useManuscriptQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useManuscriptQuery({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *   },
 * });
 */
export function useManuscriptQuery(baseOptions: Apollo.QueryHookOptions<ManuscriptQuery, ManuscriptQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ManuscriptQuery, ManuscriptQueryVariables>(ManuscriptDocument, options);
      }
export function useManuscriptLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ManuscriptQuery, ManuscriptQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ManuscriptQuery, ManuscriptQueryVariables>(ManuscriptDocument, options);
        }
export type ManuscriptQueryHookResult = ReturnType<typeof useManuscriptQuery>;
export type ManuscriptLazyQueryHookResult = ReturnType<typeof useManuscriptLazyQuery>;
export type ManuscriptQueryResult = Apollo.QueryResult<ManuscriptQuery, ManuscriptQueryVariables>;
export const ReleaseTransliterationDocument = gql`
    mutation ReleaseTransliteration($mainIdentifier: String!) {
  me {
    manuscript(mainIdentifier: $mainIdentifier) {
      releaseTransliteration
    }
  }
}
    `;
export type ReleaseTransliterationMutationFn = Apollo.MutationFunction<ReleaseTransliterationMutation, ReleaseTransliterationMutationVariables>;

/**
 * __useReleaseTransliterationMutation__
 *
 * To run a mutation, you first call `useReleaseTransliterationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReleaseTransliterationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [releaseTransliterationMutation, { data, loading, error }] = useReleaseTransliterationMutation({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *   },
 * });
 */
export function useReleaseTransliterationMutation(baseOptions?: Apollo.MutationHookOptions<ReleaseTransliterationMutation, ReleaseTransliterationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReleaseTransliterationMutation, ReleaseTransliterationMutationVariables>(ReleaseTransliterationDocument, options);
      }
export type ReleaseTransliterationMutationHookResult = ReturnType<typeof useReleaseTransliterationMutation>;
export type ReleaseTransliterationMutationResult = Apollo.MutationResult<ReleaseTransliterationMutation>;
export type ReleaseTransliterationMutationOptions = Apollo.BaseMutationOptions<ReleaseTransliterationMutation, ReleaseTransliterationMutationVariables>;
export const UploadPicturesDocument = gql`
    query UploadPictures($mainIdentifier: String!) {
  manuscript(mainIdentifier: $mainIdentifier) {
    ...ManuscriptIdentWithCreator
  }
}
    ${ManuscriptIdentWithCreatorFragmentDoc}`;

/**
 * __useUploadPicturesQuery__
 *
 * To run a query within a React component, call `useUploadPicturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useUploadPicturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUploadPicturesQuery({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *   },
 * });
 */
export function useUploadPicturesQuery(baseOptions: Apollo.QueryHookOptions<UploadPicturesQuery, UploadPicturesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UploadPicturesQuery, UploadPicturesQueryVariables>(UploadPicturesDocument, options);
      }
export function useUploadPicturesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UploadPicturesQuery, UploadPicturesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UploadPicturesQuery, UploadPicturesQueryVariables>(UploadPicturesDocument, options);
        }
export type UploadPicturesQueryHookResult = ReturnType<typeof useUploadPicturesQuery>;
export type UploadPicturesLazyQueryHookResult = ReturnType<typeof useUploadPicturesLazyQuery>;
export type UploadPicturesQueryResult = Apollo.QueryResult<UploadPicturesQuery, UploadPicturesQueryVariables>;
export const TransliterationInputDocument = gql`
    query TransliterationInput($mainIdentifier: String!) {
  manuscript(mainIdentifier: $mainIdentifier) {
    mainIdentifier {
      ...ManuscriptIdentifier
    }
  }
}
    ${ManuscriptIdentifierFragmentDoc}`;

/**
 * __useTransliterationInputQuery__
 *
 * To run a query within a React component, call `useTransliterationInputQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransliterationInputQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransliterationInputQuery({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *   },
 * });
 */
export function useTransliterationInputQuery(baseOptions: Apollo.QueryHookOptions<TransliterationInputQuery, TransliterationInputQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TransliterationInputQuery, TransliterationInputQueryVariables>(TransliterationInputDocument, options);
      }
export function useTransliterationInputLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TransliterationInputQuery, TransliterationInputQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TransliterationInputQuery, TransliterationInputQueryVariables>(TransliterationInputDocument, options);
        }
export type TransliterationInputQueryHookResult = ReturnType<typeof useTransliterationInputQuery>;
export type TransliterationInputLazyQueryHookResult = ReturnType<typeof useTransliterationInputLazyQuery>;
export type TransliterationInputQueryResult = Apollo.QueryResult<TransliterationInputQuery, TransliterationInputQueryVariables>;
export const UploadTransliterationDocument = gql`
    mutation uploadTransliteration($mainIdentifier: String!, $input: String!) {
  me {
    manuscript(mainIdentifier: $mainIdentifier) {
      updateTransliteration(input: $input)
    }
  }
}
    `;
export type UploadTransliterationMutationFn = Apollo.MutationFunction<UploadTransliterationMutation, UploadTransliterationMutationVariables>;

/**
 * __useUploadTransliterationMutation__
 *
 * To run a mutation, you first call `useUploadTransliterationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadTransliterationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadTransliterationMutation, { data, loading, error }] = useUploadTransliterationMutation({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUploadTransliterationMutation(baseOptions?: Apollo.MutationHookOptions<UploadTransliterationMutation, UploadTransliterationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadTransliterationMutation, UploadTransliterationMutationVariables>(UploadTransliterationDocument, options);
      }
export type UploadTransliterationMutationHookResult = ReturnType<typeof useUploadTransliterationMutation>;
export type UploadTransliterationMutationResult = Apollo.MutationResult<UploadTransliterationMutation>;
export type UploadTransliterationMutationOptions = Apollo.BaseMutationOptions<UploadTransliterationMutation, UploadTransliterationMutationVariables>;
export const ReviewTransliterationDocument = gql`
    query ReviewTransliteration($mainIdentifier: String!) {
  reviewerQueries {
    transliterationReview(mainIdentifier: $mainIdentifier)
  }
}
    `;

/**
 * __useReviewTransliterationQuery__
 *
 * To run a query within a React component, call `useReviewTransliterationQuery` and pass it any options that fit your needs.
 * When your component renders, `useReviewTransliterationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReviewTransliterationQuery({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *   },
 * });
 */
export function useReviewTransliterationQuery(baseOptions: Apollo.QueryHookOptions<ReviewTransliterationQuery, ReviewTransliterationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReviewTransliterationQuery, ReviewTransliterationQueryVariables>(ReviewTransliterationDocument, options);
      }
export function useReviewTransliterationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReviewTransliterationQuery, ReviewTransliterationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReviewTransliterationQuery, ReviewTransliterationQueryVariables>(ReviewTransliterationDocument, options);
        }
export type ReviewTransliterationQueryHookResult = ReturnType<typeof useReviewTransliterationQuery>;
export type ReviewTransliterationLazyQueryHookResult = ReturnType<typeof useReviewTransliterationLazyQuery>;
export type ReviewTransliterationQueryResult = Apollo.QueryResult<ReviewTransliterationQuery, ReviewTransliterationQueryVariables>;
export const SubmitTransliterationReviewDocument = gql`
    mutation SubmitTransliterationReview($mainIdentifier: String!, $review: String!) {
  reviewerMutations {
    submitTransliterationReview(mainIdentifier: $mainIdentifier, review: $review)
  }
}
    `;
export type SubmitTransliterationReviewMutationFn = Apollo.MutationFunction<SubmitTransliterationReviewMutation, SubmitTransliterationReviewMutationVariables>;

/**
 * __useSubmitTransliterationReviewMutation__
 *
 * To run a mutation, you first call `useSubmitTransliterationReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitTransliterationReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitTransliterationReviewMutation, { data, loading, error }] = useSubmitTransliterationReviewMutation({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *      review: // value for 'review'
 *   },
 * });
 */
export function useSubmitTransliterationReviewMutation(baseOptions?: Apollo.MutationHookOptions<SubmitTransliterationReviewMutation, SubmitTransliterationReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitTransliterationReviewMutation, SubmitTransliterationReviewMutationVariables>(SubmitTransliterationReviewDocument, options);
      }
export type SubmitTransliterationReviewMutationHookResult = ReturnType<typeof useSubmitTransliterationReviewMutation>;
export type SubmitTransliterationReviewMutationResult = Apollo.MutationResult<SubmitTransliterationReviewMutation>;
export type SubmitTransliterationReviewMutationOptions = Apollo.BaseMutationOptions<SubmitTransliterationReviewMutation, SubmitTransliterationReviewMutationVariables>;
export const XmlConversionDocument = gql`
    query XmlConversion($mainIdentifier: String!) {
  reviewerQueries {
    xmlConversion(mainIdentifier: $mainIdentifier)
  }
}
    `;

/**
 * __useXmlConversionQuery__
 *
 * To run a query within a React component, call `useXmlConversionQuery` and pass it any options that fit your needs.
 * When your component renders, `useXmlConversionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useXmlConversionQuery({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *   },
 * });
 */
export function useXmlConversionQuery(baseOptions: Apollo.QueryHookOptions<XmlConversionQuery, XmlConversionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<XmlConversionQuery, XmlConversionQueryVariables>(XmlConversionDocument, options);
      }
export function useXmlConversionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<XmlConversionQuery, XmlConversionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<XmlConversionQuery, XmlConversionQueryVariables>(XmlConversionDocument, options);
        }
export type XmlConversionQueryHookResult = ReturnType<typeof useXmlConversionQuery>;
export type XmlConversionLazyQueryHookResult = ReturnType<typeof useXmlConversionLazyQuery>;
export type XmlConversionQueryResult = Apollo.QueryResult<XmlConversionQuery, XmlConversionQueryVariables>;
export const SubmitXmlConversionDocument = gql`
    mutation SubmitXmlConversion($mainIdentifier: String!, $conversion: String!) {
  reviewerMutations {
    submitXmlConversion(mainIdentifier: $mainIdentifier, conversion: $conversion)
  }
}
    `;
export type SubmitXmlConversionMutationFn = Apollo.MutationFunction<SubmitXmlConversionMutation, SubmitXmlConversionMutationVariables>;

/**
 * __useSubmitXmlConversionMutation__
 *
 * To run a mutation, you first call `useSubmitXmlConversionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitXmlConversionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitXmlConversionMutation, { data, loading, error }] = useSubmitXmlConversionMutation({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *      conversion: // value for 'conversion'
 *   },
 * });
 */
export function useSubmitXmlConversionMutation(baseOptions?: Apollo.MutationHookOptions<SubmitXmlConversionMutation, SubmitXmlConversionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitXmlConversionMutation, SubmitXmlConversionMutationVariables>(SubmitXmlConversionDocument, options);
      }
export type SubmitXmlConversionMutationHookResult = ReturnType<typeof useSubmitXmlConversionMutation>;
export type SubmitXmlConversionMutationResult = Apollo.MutationResult<SubmitXmlConversionMutation>;
export type SubmitXmlConversionMutationOptions = Apollo.BaseMutationOptions<SubmitXmlConversionMutation, SubmitXmlConversionMutationVariables>;
export const XmlReviewDocument = gql`
    query XmlReview($mainIdentifier: String!, $reviewType: XmlReviewType!) {
  reviewerQueries {
    xmlReview(mainIdentifier: $mainIdentifier, reviewType: $reviewType)
  }
}
    `;

/**
 * __useXmlReviewQuery__
 *
 * To run a query within a React component, call `useXmlReviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useXmlReviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useXmlReviewQuery({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *      reviewType: // value for 'reviewType'
 *   },
 * });
 */
export function useXmlReviewQuery(baseOptions: Apollo.QueryHookOptions<XmlReviewQuery, XmlReviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<XmlReviewQuery, XmlReviewQueryVariables>(XmlReviewDocument, options);
      }
export function useXmlReviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<XmlReviewQuery, XmlReviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<XmlReviewQuery, XmlReviewQueryVariables>(XmlReviewDocument, options);
        }
export type XmlReviewQueryHookResult = ReturnType<typeof useXmlReviewQuery>;
export type XmlReviewLazyQueryHookResult = ReturnType<typeof useXmlReviewLazyQuery>;
export type XmlReviewQueryResult = Apollo.QueryResult<XmlReviewQuery, XmlReviewQueryVariables>;
export const SubmitXmlReviewDocument = gql`
    mutation SubmitXmlReview($mainIdentifier: String!, $review: String!, $reviewType: XmlReviewType!) {
  reviewerMutations {
    submitXmlReview(
      mainIdentifier: $mainIdentifier
      review: $review
      reviewType: $reviewType
    )
  }
}
    `;
export type SubmitXmlReviewMutationFn = Apollo.MutationFunction<SubmitXmlReviewMutation, SubmitXmlReviewMutationVariables>;

/**
 * __useSubmitXmlReviewMutation__
 *
 * To run a mutation, you first call `useSubmitXmlReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitXmlReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitXmlReviewMutation, { data, loading, error }] = useSubmitXmlReviewMutation({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *      review: // value for 'review'
 *      reviewType: // value for 'reviewType'
 *   },
 * });
 */
export function useSubmitXmlReviewMutation(baseOptions?: Apollo.MutationHookOptions<SubmitXmlReviewMutation, SubmitXmlReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitXmlReviewMutation, SubmitXmlReviewMutationVariables>(SubmitXmlReviewDocument, options);
      }
export type SubmitXmlReviewMutationHookResult = ReturnType<typeof useSubmitXmlReviewMutation>;
export type SubmitXmlReviewMutationResult = Apollo.MutationResult<SubmitXmlReviewMutation>;
export type SubmitXmlReviewMutationOptions = Apollo.BaseMutationOptions<SubmitXmlReviewMutation, SubmitXmlReviewMutationVariables>;
export const ApprovalDocument = gql`
    query Approval($mainIdentifier: String!) {
  executiveEditorQueries {
    __typename
    documentAwaitingApproval(mainIdentifier: $mainIdentifier)
  }
}
    `;

/**
 * __useApprovalQuery__
 *
 * To run a query within a React component, call `useApprovalQuery` and pass it any options that fit your needs.
 * When your component renders, `useApprovalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApprovalQuery({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *   },
 * });
 */
export function useApprovalQuery(baseOptions: Apollo.QueryHookOptions<ApprovalQuery, ApprovalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ApprovalQuery, ApprovalQueryVariables>(ApprovalDocument, options);
      }
export function useApprovalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ApprovalQuery, ApprovalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ApprovalQuery, ApprovalQueryVariables>(ApprovalDocument, options);
        }
export type ApprovalQueryHookResult = ReturnType<typeof useApprovalQuery>;
export type ApprovalLazyQueryHookResult = ReturnType<typeof useApprovalLazyQuery>;
export type ApprovalQueryResult = Apollo.QueryResult<ApprovalQuery, ApprovalQueryVariables>;
export const SubmitApprovalDocument = gql`
    mutation SubmitApproval($mainIdentifier: String!, $input: String!) {
  executiveEditor {
    submitApproval(manuscriptIdentifier: $mainIdentifier, input: $input)
  }
}
    `;
export type SubmitApprovalMutationFn = Apollo.MutationFunction<SubmitApprovalMutation, SubmitApprovalMutationVariables>;

/**
 * __useSubmitApprovalMutation__
 *
 * To run a mutation, you first call `useSubmitApprovalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitApprovalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitApprovalMutation, { data, loading, error }] = useSubmitApprovalMutation({
 *   variables: {
 *      mainIdentifier: // value for 'mainIdentifier'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitApprovalMutation(baseOptions?: Apollo.MutationHookOptions<SubmitApprovalMutation, SubmitApprovalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitApprovalMutation, SubmitApprovalMutationVariables>(SubmitApprovalDocument, options);
      }
export type SubmitApprovalMutationHookResult = ReturnType<typeof useSubmitApprovalMutation>;
export type SubmitApprovalMutationResult = Apollo.MutationResult<SubmitApprovalMutation>;
export type SubmitApprovalMutationOptions = Apollo.BaseMutationOptions<SubmitApprovalMutation, SubmitApprovalMutationVariables>;
export const PipelineOverviewDocument = gql`
    query PipelineOverview($page: Int) {
  executiveEditorQueries {
    ...PipelineOverview
  }
}
    ${PipelineOverviewFragmentDoc}`;

/**
 * __usePipelineOverviewQuery__
 *
 * To run a query within a React component, call `usePipelineOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `usePipelineOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePipelineOverviewQuery({
 *   variables: {
 *      page: // value for 'page'
 *   },
 * });
 */
export function usePipelineOverviewQuery(baseOptions?: Apollo.QueryHookOptions<PipelineOverviewQuery, PipelineOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PipelineOverviewQuery, PipelineOverviewQueryVariables>(PipelineOverviewDocument, options);
      }
export function usePipelineOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PipelineOverviewQuery, PipelineOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PipelineOverviewQuery, PipelineOverviewQueryVariables>(PipelineOverviewDocument, options);
        }
export type PipelineOverviewQueryHookResult = ReturnType<typeof usePipelineOverviewQuery>;
export type PipelineOverviewLazyQueryHookResult = ReturnType<typeof usePipelineOverviewLazyQuery>;
export type PipelineOverviewQueryResult = Apollo.QueryResult<PipelineOverviewQuery, PipelineOverviewQueryVariables>;
export const AppointTransliterationReviewerDocument = gql`
    mutation AppointTransliterationReviewer($manuscriptIdentifier: String!, $reviewer: String!) {
  executiveEditor {
    appointTransliterationReviewer(
      manuscriptIdentifier: $manuscriptIdentifier
      reviewer: $reviewer
    )
  }
}
    `;
export type AppointTransliterationReviewerMutationFn = Apollo.MutationFunction<AppointTransliterationReviewerMutation, AppointTransliterationReviewerMutationVariables>;

/**
 * __useAppointTransliterationReviewerMutation__
 *
 * To run a mutation, you first call `useAppointTransliterationReviewerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAppointTransliterationReviewerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [appointTransliterationReviewerMutation, { data, loading, error }] = useAppointTransliterationReviewerMutation({
 *   variables: {
 *      manuscriptIdentifier: // value for 'manuscriptIdentifier'
 *      reviewer: // value for 'reviewer'
 *   },
 * });
 */
export function useAppointTransliterationReviewerMutation(baseOptions?: Apollo.MutationHookOptions<AppointTransliterationReviewerMutation, AppointTransliterationReviewerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AppointTransliterationReviewerMutation, AppointTransliterationReviewerMutationVariables>(AppointTransliterationReviewerDocument, options);
      }
export type AppointTransliterationReviewerMutationHookResult = ReturnType<typeof useAppointTransliterationReviewerMutation>;
export type AppointTransliterationReviewerMutationResult = Apollo.MutationResult<AppointTransliterationReviewerMutation>;
export type AppointTransliterationReviewerMutationOptions = Apollo.BaseMutationOptions<AppointTransliterationReviewerMutation, AppointTransliterationReviewerMutationVariables>;
export const AppointXmlConverterDocument = gql`
    mutation AppointXmlConverter($manuscriptIdentifier: String!, $converter: String!) {
  executiveEditor {
    appointXmlConverter(
      manuscriptIdentifier: $manuscriptIdentifier
      converter: $converter
    )
  }
}
    `;
export type AppointXmlConverterMutationFn = Apollo.MutationFunction<AppointXmlConverterMutation, AppointXmlConverterMutationVariables>;

/**
 * __useAppointXmlConverterMutation__
 *
 * To run a mutation, you first call `useAppointXmlConverterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAppointXmlConverterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [appointXmlConverterMutation, { data, loading, error }] = useAppointXmlConverterMutation({
 *   variables: {
 *      manuscriptIdentifier: // value for 'manuscriptIdentifier'
 *      converter: // value for 'converter'
 *   },
 * });
 */
export function useAppointXmlConverterMutation(baseOptions?: Apollo.MutationHookOptions<AppointXmlConverterMutation, AppointXmlConverterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AppointXmlConverterMutation, AppointXmlConverterMutationVariables>(AppointXmlConverterDocument, options);
      }
export type AppointXmlConverterMutationHookResult = ReturnType<typeof useAppointXmlConverterMutation>;
export type AppointXmlConverterMutationResult = Apollo.MutationResult<AppointXmlConverterMutation>;
export type AppointXmlConverterMutationOptions = Apollo.BaseMutationOptions<AppointXmlConverterMutation, AppointXmlConverterMutationVariables>;
export const AppointFirstXmlReviewerDocument = gql`
    mutation AppointFirstXmlReviewer($manuscriptIdentifier: String!, $reviewer: String!) {
  executiveEditor {
    appointFirstXmlReviewer(
      manuscriptIdentifier: $manuscriptIdentifier
      reviewer: $reviewer
    )
  }
}
    `;
export type AppointFirstXmlReviewerMutationFn = Apollo.MutationFunction<AppointFirstXmlReviewerMutation, AppointFirstXmlReviewerMutationVariables>;

/**
 * __useAppointFirstXmlReviewerMutation__
 *
 * To run a mutation, you first call `useAppointFirstXmlReviewerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAppointFirstXmlReviewerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [appointFirstXmlReviewerMutation, { data, loading, error }] = useAppointFirstXmlReviewerMutation({
 *   variables: {
 *      manuscriptIdentifier: // value for 'manuscriptIdentifier'
 *      reviewer: // value for 'reviewer'
 *   },
 * });
 */
export function useAppointFirstXmlReviewerMutation(baseOptions?: Apollo.MutationHookOptions<AppointFirstXmlReviewerMutation, AppointFirstXmlReviewerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AppointFirstXmlReviewerMutation, AppointFirstXmlReviewerMutationVariables>(AppointFirstXmlReviewerDocument, options);
      }
export type AppointFirstXmlReviewerMutationHookResult = ReturnType<typeof useAppointFirstXmlReviewerMutation>;
export type AppointFirstXmlReviewerMutationResult = Apollo.MutationResult<AppointFirstXmlReviewerMutation>;
export type AppointFirstXmlReviewerMutationOptions = Apollo.BaseMutationOptions<AppointFirstXmlReviewerMutation, AppointFirstXmlReviewerMutationVariables>;
export const AppointSecondXmlReviewerDocument = gql`
    mutation AppointSecondXmlReviewer($manuscriptIdentifier: String!, $reviewer: String!) {
  executiveEditor {
    appointSecondXmlReviewer(
      manuscriptIdentifier: $manuscriptIdentifier
      reviewer: $reviewer
    )
  }
}
    `;
export type AppointSecondXmlReviewerMutationFn = Apollo.MutationFunction<AppointSecondXmlReviewerMutation, AppointSecondXmlReviewerMutationVariables>;

/**
 * __useAppointSecondXmlReviewerMutation__
 *
 * To run a mutation, you first call `useAppointSecondXmlReviewerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAppointSecondXmlReviewerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [appointSecondXmlReviewerMutation, { data, loading, error }] = useAppointSecondXmlReviewerMutation({
 *   variables: {
 *      manuscriptIdentifier: // value for 'manuscriptIdentifier'
 *      reviewer: // value for 'reviewer'
 *   },
 * });
 */
export function useAppointSecondXmlReviewerMutation(baseOptions?: Apollo.MutationHookOptions<AppointSecondXmlReviewerMutation, AppointSecondXmlReviewerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AppointSecondXmlReviewerMutation, AppointSecondXmlReviewerMutationVariables>(AppointSecondXmlReviewerDocument, options);
      }
export type AppointSecondXmlReviewerMutationHookResult = ReturnType<typeof useAppointSecondXmlReviewerMutation>;
export type AppointSecondXmlReviewerMutationResult = Apollo.MutationResult<AppointSecondXmlReviewerMutation>;
export type AppointSecondXmlReviewerMutationOptions = Apollo.BaseMutationOptions<AppointSecondXmlReviewerMutation, AppointSecondXmlReviewerMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($userInput: UserInput!) {
  register(userInput: $userInput)
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      userInput: // value for 'userInput'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password)
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const UsersOverviewDocument = gql`
    query UsersOverview($page: Int!) {
  executiveEditorQueries {
    userCount
    users(page: $page) {
      ...User
    }
  }
}
    ${UserFragmentDoc}`;

/**
 * __useUsersOverviewQuery__
 *
 * To run a query within a React component, call `useUsersOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersOverviewQuery({
 *   variables: {
 *      page: // value for 'page'
 *   },
 * });
 */
export function useUsersOverviewQuery(baseOptions: Apollo.QueryHookOptions<UsersOverviewQuery, UsersOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersOverviewQuery, UsersOverviewQueryVariables>(UsersOverviewDocument, options);
      }
export function useUsersOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersOverviewQuery, UsersOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersOverviewQuery, UsersOverviewQueryVariables>(UsersOverviewDocument, options);
        }
export type UsersOverviewQueryHookResult = ReturnType<typeof useUsersOverviewQuery>;
export type UsersOverviewLazyQueryHookResult = ReturnType<typeof useUsersOverviewLazyQuery>;
export type UsersOverviewQueryResult = Apollo.QueryResult<UsersOverviewQuery, UsersOverviewQueryVariables>;
export const UpdateUserRightsDocument = gql`
    mutation UpdateUserRights($username: String!, $newRights: Rights!) {
  executiveEditor {
    updateUserRights(username: $username, newRights: $newRights)
  }
}
    `;
export type UpdateUserRightsMutationFn = Apollo.MutationFunction<UpdateUserRightsMutation, UpdateUserRightsMutationVariables>;

/**
 * __useUpdateUserRightsMutation__
 *
 * To run a mutation, you first call `useUpdateUserRightsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserRightsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserRightsMutation, { data, loading, error }] = useUpdateUserRightsMutation({
 *   variables: {
 *      username: // value for 'username'
 *      newRights: // value for 'newRights'
 *   },
 * });
 */
export function useUpdateUserRightsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserRightsMutation, UpdateUserRightsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserRightsMutation, UpdateUserRightsMutationVariables>(UpdateUserRightsDocument, options);
      }
export type UpdateUserRightsMutationHookResult = ReturnType<typeof useUpdateUserRightsMutation>;
export type UpdateUserRightsMutationResult = Apollo.MutationResult<UpdateUserRightsMutation>;
export type UpdateUserRightsMutationOptions = Apollo.BaseMutationOptions<UpdateUserRightsMutation, UpdateUserRightsMutationVariables>;