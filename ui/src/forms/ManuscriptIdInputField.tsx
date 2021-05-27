import React from 'react';
import {ErrorMessage, Field, FormikErrors, FormikTouched} from "formik";
import {ManuscriptIdentifierInput, ManuscriptIdentifierType} from "../generated/graphql";
import {useTranslation} from "react-i18next";
import classnames from 'classnames';

interface IProps {
    mainId: string;
    deleteFunc?: () => void;
    value?: ManuscriptIdentifierInput | null;
    errors: FormikErrors<ManuscriptIdentifierInput> | undefined;
    touched: FormikTouched<ManuscriptIdentifierInput> | undefined;
}

export function ManuscriptIdInputField({mainId, deleteFunc, value, errors, touched}: IProps): JSX.Element {

    const {t} = useTranslation('common');

    const identifierClassName = classnames("input", {
        'is-success': touched?.identifier && !errors?.identifier,
        'is-danger': touched?.identifier && errors?.identifier
    });

    const identifierTypeClassName = classnames("select", {
        'is-success': touched?.identifierType && !errors?.identifierType,
        'is-danger': touched?.identifierType && errors?.identifierType
    });

    return (
        <>
            <div className="field has-addons">
                <div className="control is-expanded">
                    <Field id={`${mainId}.identifier`} name={`${mainId}.identifier`} value={value?.identifier}
                           className={identifierClassName} placeholder={t('Identifikator')}/>
                </div>
                <div className="control">
                    <div className={identifierTypeClassName}>
                        <Field as="select" name={`${mainId}.identifierType`} id={`${mainId}.identifierType`}>
                            <option value={ManuscriptIdentifierType.ExcavationNumber}>{t('Ausgrabungsnummer')}</option>
                            <option value={ManuscriptIdentifierType.CollectionNumber}>{t('Sammlungsnummer')}</option>
                            {deleteFunc && <option value={ManuscriptIdentifierType.PublicationShortReference}>
                                {t('Publikationsnummer')}
                            </option>}
                        </Field>
                    </div>
                </div>
                {deleteFunc && <div className="control">
                    <button className="button is-danger" type="button" onClick={deleteFunc}>-</button>
                </div>}
            </div>
            <ErrorMessage name={`${mainId}.identifier`}>
                {msg => <p className="help is-danger">{msg}</p>}
            </ErrorMessage>
            <ErrorMessage name={`${mainId}.identifierType`}>
                {msg => <p className="help is-danger">{msg}</p>}
            </ErrorMessage>
        </>
    )
}
