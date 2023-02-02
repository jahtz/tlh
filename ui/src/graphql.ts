import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type LineNumber = {
  __typename?: 'LineNumber';
  isConfirmed: Scalars['Boolean'];
  number: Scalars['Int'];
};

export type LineNumberInput = {
  isConfirmed: Scalars['Boolean'];
  number: Scalars['Int'];
};

export type LoggedInUserMutations = {
  __typename?: 'LoggedInUserMutations';
  createManuscript?: Maybe<Scalars['String']>;
  manuscript?: Maybe<ManuscriptMutations>;
};


export type LoggedInUserMutationsCreateManuscriptArgs = {
  values?: InputMaybe<ManuscriptMetaDataInput>;
};


export type LoggedInUserMutationsManuscriptArgs = {
  mainIdentifier: Scalars['String'];
};

export enum ManuscriptColumn {
  ColumnDivider = 'ColumnDivider',
  I = 'I',
  Ii = 'II',
  Iii = 'III',
  Iv = 'IV',
  Ix = 'IX',
  LeftColumn = 'LeftColumn',
  MiddleColumn = 'MiddleColumn',
  None = 'None',
  RightColumn = 'RightColumn',
  V = 'V',
  Vi = 'VI',
  Vii = 'VII',
  Viii = 'VIII',
  X = 'X',
  Xi = 'XI',
  Xii = 'XII'
}

export enum ManuscriptColumnModifier {
  None = 'None',
  Slash = 'Slash',
  SlashQuestion = 'SlashQuestion'
}

export type ManuscriptIdentifier = {
  __typename?: 'ManuscriptIdentifier';
  identifier: Scalars['String'];
  identifierType: ManuscriptIdentifierType;
};

export type ManuscriptIdentifierInput = {
  identifier: Scalars['String'];
  identifierType: ManuscriptIdentifierType;
};

export enum ManuscriptIdentifierType {
  CollectionNumber = 'CollectionNumber',
  ExcavationNumber = 'ExcavationNumber',
  PublicationShortReference = 'PublicationShortReference'
}

export type ManuscriptLanguage = {
  __typename?: 'ManuscriptLanguage';
  abbreviation: Scalars['String'];
  name: Scalars['String'];
};

export type ManuscriptMetaData = {
  __typename?: 'ManuscriptMetaData';
  bibliography?: Maybe<Scalars['String']>;
  creatorUsername: Scalars['String'];
  cthClassification?: Maybe<Scalars['Int']>;
  mainIdentifier: ManuscriptIdentifier;
  otherIdentifiers: Array<ManuscriptIdentifier>;
  palaeographicClassification: PalaeographicClassification;
  palaeographicClassificationSure: Scalars['Boolean'];
  pictureUrls: Array<Scalars['String']>;
  provenance?: Maybe<Scalars['String']>;
  status?: Maybe<ManuscriptStatus>;
  transliterations?: Maybe<Array<TransliterationSide>>;
};

export type ManuscriptMetaDataInput = {
  bibliography?: InputMaybe<Scalars['String']>;
  cthClassification?: InputMaybe<Scalars['Int']>;
  mainIdentifier: ManuscriptIdentifierInput;
  otherIdentifiers: Array<ManuscriptIdentifierInput>;
  palaeographicClassification: PalaeographicClassification;
  palaeographicClassificationSure: Scalars['Boolean'];
  provenance?: InputMaybe<Scalars['String']>;
};

export type ManuscriptMutations = {
  __typename?: 'ManuscriptMutations';
  updateTransliteration: Scalars['Boolean'];
};


export type ManuscriptMutationsUpdateTransliterationArgs = {
  values: Array<TransliterationSideInput>;
};

export enum ManuscriptSide {
  InscriptionNumber = 'InscriptionNumber',
  LeftEdge = 'LeftEdge',
  LowerEdge = 'LowerEdge',
  NotIdentifiable = 'NotIdentifiable',
  Obverse = 'Obverse',
  Reverse = 'Reverse',
  RightEdge = 'RightEdge',
  SealInscription = 'SealInscription',
  SideA = 'SideA',
  SideB = 'SideB',
  UpperEdge = 'UpperEdge'
}

export enum ManuscriptStatus {
  Approved = 'Approved',
  Created = 'Created',
  ExecutiveReviewMerged = 'ExecutiveReviewMerged',
  ExecutiveReviewed = 'ExecutiveReviewed',
  InCreation = 'InCreation',
  ReviewMerged = 'ReviewMerged',
  Reviewed = 'Reviewed'
}

export type Mutation = {
  __typename?: 'Mutation';
  login?: Maybe<Scalars['String']>;
  me?: Maybe<LoggedInUserMutations>;
  register?: Maybe<Scalars['String']>;
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationRegisterArgs = {
  userInput: UserInput;
};

export enum PalaeographicClassification {
  AssyroMittanianScript = 'AssyroMittanianScript',
  LateNewScript = 'LateNewScript',
  MiddleAssyrianScript = 'MiddleAssyrianScript',
  MiddleBabylonianScript = 'MiddleBabylonianScript',
  MiddleScript = 'MiddleScript',
  NewScript = 'NewScript',
  OldAssyrianScript = 'OldAssyrianScript',
  OldScript = 'OldScript',
  Unclassified = 'Unclassified'
}

export type Query = {
  __typename?: 'Query';
  allManuscripts: Array<ManuscriptMetaData>;
  manuscript?: Maybe<ManuscriptMetaData>;
  manuscriptCount: Scalars['Int'];
  manuscriptLanguages: Array<ManuscriptLanguage>;
};


export type QueryAllManuscriptsArgs = {
  page: Scalars['Int'];
  paginationSize: Scalars['Int'];
};


export type QueryManuscriptArgs = {
  mainIdentifier: Scalars['String'];
};

export type TransliterationColumn = {
  __typename?: 'TransliterationColumn';
  column: ManuscriptColumn;
  columnIndex: Scalars['Int'];
  columnModifier: ManuscriptColumnModifier;
  lines: Array<TransliterationLine>;
};

export type TransliterationColumnInput = {
  column: ManuscriptColumn;
  columnIndex: Scalars['Int'];
  columnModifier: ManuscriptColumnModifier;
  lines: Array<TransliterationLineInput>;
};

export type TransliterationLine = {
  __typename?: 'TransliterationLine';
  input: Scalars['String'];
  inputIndex: Scalars['Int'];
  lineNumber?: Maybe<LineNumber>;
  result?: Maybe<Scalars['String']>;
};

export type TransliterationLineInput = {
  input: Scalars['String'];
  lineIndex: Scalars['Int'];
  lineNumber?: InputMaybe<LineNumberInput>;
  result?: InputMaybe<Scalars['String']>;
};

export type TransliterationSide = {
  __typename?: 'TransliterationSide';
  columns: Array<TransliterationColumn>;
  side: ManuscriptSide;
  sideIndex: Scalars['Int'];
  version: Scalars['Int'];
};

export type TransliterationSideInput = {
  columns: Array<TransliterationColumnInput>;
  side: ManuscriptSide;
  sideIndex: Scalars['Int'];
};

export type UserInput = {
  affiliation?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
  passwordRepeat: Scalars['String'];
  username: Scalars['String'];
};

export type ManuscriptIdentifierFragment = { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string };

export type ManuscriptLanguageFragment = { __typename?: 'ManuscriptLanguage', name: string, abbreviation: string };

export type AllManuscriptLanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllManuscriptLanguagesQuery = { __typename?: 'Query', manuscriptLanguages: Array<{ __typename?: 'ManuscriptLanguage', name: string, abbreviation: string }> };

export type RegisterMutationVariables = Exact<{
  userInput: UserInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register?: string | null };

export type LoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: string | null };

export type ManuscriptBasicDataFragment = { __typename?: 'ManuscriptMetaData', status?: ManuscriptStatus | null, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } };

export type IndexQueryVariables = Exact<{
  paginationSize?: Scalars['Int'];
  page?: Scalars['Int'];
}>;


export type IndexQuery = { __typename?: 'Query', manuscriptCount: number, allManuscripts: Array<{ __typename?: 'ManuscriptMetaData', status?: ManuscriptStatus | null, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } }> };

export type CreateManuscriptMutationVariables = Exact<{
  manuscriptMetaData?: InputMaybe<ManuscriptMetaDataInput>;
}>;


export type CreateManuscriptMutation = { __typename?: 'Mutation', me?: { __typename?: 'LoggedInUserMutations', createManuscript?: string | null } | null };

export type TransliterationColumnFragment = { __typename?: 'TransliterationColumn', columnIndex: number, lines: Array<{ __typename?: 'TransliterationLine', inputIndex: number, input: string, result?: string | null, lineNumber?: { __typename?: 'LineNumber', number: number, isConfirmed: boolean } | null }> };

export type TransliterationSideFragment = { __typename?: 'TransliterationSide', sideIndex: number, side: ManuscriptSide, version: number, columns: Array<{ __typename?: 'TransliterationColumn', columnIndex: number, lines: Array<{ __typename?: 'TransliterationLine', inputIndex: number, input: string, result?: string | null, lineNumber?: { __typename?: 'LineNumber', number: number, isConfirmed: boolean } | null }> }> };

export type ManuscriptMetaDataFragment = { __typename?: 'ManuscriptMetaData', bibliography?: string | null, cthClassification?: number | null, palaeographicClassification: PalaeographicClassification, palaeographicClassificationSure: boolean, provenance?: string | null, creatorUsername: string, pictureUrls: Array<string>, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }, otherIdentifiers: Array<{ __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }>, transliterations?: Array<{ __typename?: 'TransliterationSide', sideIndex: number, side: ManuscriptSide, version: number, columns: Array<{ __typename?: 'TransliterationColumn', columnIndex: number, lines: Array<{ __typename?: 'TransliterationLine', inputIndex: number, input: string, result?: string | null, lineNumber?: { __typename?: 'LineNumber', number: number, isConfirmed: boolean } | null }> }> }> | null };

export type ManuscriptQueryVariables = Exact<{
  mainIdentifier: Scalars['String'];
}>;


export type ManuscriptQuery = { __typename?: 'Query', manuscript?: { __typename?: 'ManuscriptMetaData', bibliography?: string | null, cthClassification?: number | null, palaeographicClassification: PalaeographicClassification, palaeographicClassificationSure: boolean, provenance?: string | null, creatorUsername: string, pictureUrls: Array<string>, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }, otherIdentifiers: Array<{ __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string }>, transliterations?: Array<{ __typename?: 'TransliterationSide', sideIndex: number, side: ManuscriptSide, version: number, columns: Array<{ __typename?: 'TransliterationColumn', columnIndex: number, lines: Array<{ __typename?: 'TransliterationLine', inputIndex: number, input: string, result?: string | null, lineNumber?: { __typename?: 'LineNumber', number: number, isConfirmed: boolean } | null }> }> }> | null } | null };

export type ManuscriptIdentWithCreatorFragment = { __typename?: 'ManuscriptMetaData', pictureUrls: Array<string>, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } };

export type UploadPicturesQueryVariables = Exact<{
  mainIdentifier: Scalars['String'];
}>;


export type UploadPicturesQuery = { __typename?: 'Query', manuscript?: { __typename?: 'ManuscriptMetaData', pictureUrls: Array<string>, creatorUsername: string, mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } } | null };

export type TransliterationInputQueryVariables = Exact<{
  mainIdentifier: Scalars['String'];
}>;


export type TransliterationInputQuery = { __typename?: 'Query', manuscript?: { __typename?: 'ManuscriptMetaData', mainIdentifier: { __typename?: 'ManuscriptIdentifier', identifierType: ManuscriptIdentifierType, identifier: string } } | null };

export type UploadTransliterationMutationVariables = Exact<{
  mainIdentifier: Scalars['String'];
  values: Array<TransliterationSideInput> | TransliterationSideInput;
}>;


export type UploadTransliterationMutation = { __typename?: 'Mutation', me?: { __typename?: 'LoggedInUserMutations', manuscript?: { __typename?: 'ManuscriptMutations', updateTransliteration: boolean } | null } | null };

export const ManuscriptLanguageFragmentDoc = gql`
    fragment ManuscriptLanguage on ManuscriptLanguage {
  name
  abbreviation
}
    `;
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
export const TransliterationColumnFragmentDoc = gql`
    fragment TransliterationColumn on TransliterationColumn {
  columnIndex
  lines {
    inputIndex
    lineNumber {
      number
      isConfirmed
    }
    input
    result
  }
}
    `;
export const TransliterationSideFragmentDoc = gql`
    fragment TransliterationSide on TransliterationSide {
  sideIndex
  side
  version
  columns {
    ...TransliterationColumn
  }
}
    ${TransliterationColumnFragmentDoc}`;
export const ManuscriptMetaDataFragmentDoc = gql`
    fragment ManuscriptMetaData on ManuscriptMetaData {
  mainIdentifier {
    ...ManuscriptIdentifier
  }
  otherIdentifiers {
    ...ManuscriptIdentifier
  }
  bibliography
  cthClassification
  palaeographicClassification
  palaeographicClassificationSure
  provenance
  creatorUsername
  pictureUrls
  transliterations {
    ...TransliterationSide
  }
}
    ${ManuscriptIdentifierFragmentDoc}
${TransliterationSideFragmentDoc}`;
export const ManuscriptIdentWithCreatorFragmentDoc = gql`
    fragment ManuscriptIdentWithCreator on ManuscriptMetaData {
  mainIdentifier {
    ...ManuscriptIdentifier
  }
  pictureUrls
  creatorUsername
}
    ${ManuscriptIdentifierFragmentDoc}`;
export const AllManuscriptLanguagesDocument = gql`
    query AllManuscriptLanguages {
  manuscriptLanguages {
    ...ManuscriptLanguage
  }
}
    ${ManuscriptLanguageFragmentDoc}`;

/**
 * __useAllManuscriptLanguagesQuery__
 *
 * To run a query within a React component, call `useAllManuscriptLanguagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllManuscriptLanguagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllManuscriptLanguagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllManuscriptLanguagesQuery(baseOptions?: Apollo.QueryHookOptions<AllManuscriptLanguagesQuery, AllManuscriptLanguagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllManuscriptLanguagesQuery, AllManuscriptLanguagesQueryVariables>(AllManuscriptLanguagesDocument, options);
      }
export function useAllManuscriptLanguagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllManuscriptLanguagesQuery, AllManuscriptLanguagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllManuscriptLanguagesQuery, AllManuscriptLanguagesQueryVariables>(AllManuscriptLanguagesDocument, options);
        }
export type AllManuscriptLanguagesQueryHookResult = ReturnType<typeof useAllManuscriptLanguagesQuery>;
export type AllManuscriptLanguagesLazyQueryHookResult = ReturnType<typeof useAllManuscriptLanguagesLazyQuery>;
export type AllManuscriptLanguagesQueryResult = Apollo.QueryResult<AllManuscriptLanguagesQuery, AllManuscriptLanguagesQueryVariables>;
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
export const IndexDocument = gql`
    query Index($paginationSize: Int! = 10, $page: Int! = 0) {
  manuscriptCount
  allManuscripts(paginationSize: $paginationSize, page: $page) {
    ...ManuscriptBasicData
  }
}
    ${ManuscriptBasicDataFragmentDoc}`;

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
 *      paginationSize: // value for 'paginationSize'
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
    createManuscript(values: $manuscriptMetaData)
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
    mutation uploadTransliteration($mainIdentifier: String!, $values: [TransliterationSideInput!]!) {
  me {
    manuscript(mainIdentifier: $mainIdentifier) {
      updateTransliteration(values: $values)
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
 *      values: // value for 'values'
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
export const MANUSCRIPT_COLUMN: ManuscriptColumn[] = [ManuscriptColumn.ColumnDivider, ManuscriptColumn.I, ManuscriptColumn.Ii, ManuscriptColumn.Iii, ManuscriptColumn.Iv, ManuscriptColumn.Ix, ManuscriptColumn.LeftColumn, ManuscriptColumn.MiddleColumn, ManuscriptColumn.None, ManuscriptColumn.RightColumn, ManuscriptColumn.V, ManuscriptColumn.Vi, ManuscriptColumn.Vii, ManuscriptColumn.Viii, ManuscriptColumn.X, ManuscriptColumn.Xi, ManuscriptColumn.Xii];
export const MANUSCRIPT_COLUMN_MODIFIER: ManuscriptColumnModifier[] = [ManuscriptColumnModifier.None, ManuscriptColumnModifier.Slash, ManuscriptColumnModifier.SlashQuestion];
export const MANUSCRIPT_IDENTIFIER_TYPE: ManuscriptIdentifierType[] = [ManuscriptIdentifierType.CollectionNumber, ManuscriptIdentifierType.ExcavationNumber, ManuscriptIdentifierType.PublicationShortReference];
export const MANUSCRIPT_SIDE: ManuscriptSide[] = [ManuscriptSide.InscriptionNumber, ManuscriptSide.LeftEdge, ManuscriptSide.LowerEdge, ManuscriptSide.NotIdentifiable, ManuscriptSide.Obverse, ManuscriptSide.Reverse, ManuscriptSide.RightEdge, ManuscriptSide.SealInscription, ManuscriptSide.SideA, ManuscriptSide.SideB, ManuscriptSide.UpperEdge];
export const MANUSCRIPT_STATUS: ManuscriptStatus[] = [ManuscriptStatus.Approved, ManuscriptStatus.Created, ManuscriptStatus.ExecutiveReviewMerged, ManuscriptStatus.ExecutiveReviewed, ManuscriptStatus.InCreation, ManuscriptStatus.ReviewMerged, ManuscriptStatus.Reviewed];
export const PALAEOGRAPHIC_CLASSIFICATION: PalaeographicClassification[] = [PalaeographicClassification.AssyroMittanianScript, PalaeographicClassification.LateNewScript, PalaeographicClassification.MiddleAssyrianScript, PalaeographicClassification.MiddleBabylonianScript, PalaeographicClassification.MiddleScript, PalaeographicClassification.NewScript, PalaeographicClassification.OldAssyrianScript, PalaeographicClassification.OldScript, PalaeographicClassification.Unclassified];