import {ErrorMessage, Field, FieldProps} from 'formik';
import classNames from 'classnames';
import React, {ChangeEvent} from 'react';

interface CustomFieldProps extends FieldProps {
  label: string;
  id: string;
  asTextArea?: boolean;
}

export function BulmaField({label, id, asTextArea, field, form, ...props}: CustomFieldProps): JSX.Element {
  const classes = classNames(
    asTextArea ? 'textarea' : 'input',
    {
      'is-success': form.touched[field.name] && !form.errors[field.name],
      'is-danger': form.touched[field.name] && !!form.errors[field.name],
    });

  return (
    <div className="field">
      <label htmlFor="id" className="label">{label}:</label>
      <div className="control">
        {asTextArea
          ? <Field as="textarea" {...props} {...field} id={id} className={classes} placeholder={label}/>
          : <Field  {...props} {...field} id={id} className={classes} placeholder={label}/>
        }
      </div>
      <ErrorMessage name={field.name}>{msg => <p className="help is-danger">{msg}</p>}</ErrorMessage>
    </div>
  );
}

// Object Select

export interface SelectOption<T> {
  value: T;
  label: string;
}

interface CustomSelectProps<T> {
  label: string;
  id: string;
  currentValue: T;
  options: SelectOption<T>[];
  onUpdate: (t: T) => void;
}

export function BulmaObjectSelect<T>({label, id, currentValue, options, onUpdate}: CustomSelectProps<T>): JSX.Element {
  // FIXME: remove bulma stuff, make more generic!

  function onValueChange(event: ChangeEvent<HTMLSelectElement>) {
    onUpdate(options[event.target.selectedIndex].value);
  }

  const currentValueLabel = options.find(({value}) => value === currentValue)?.label;

  return <div className="field">
    <label htmlFor={id} className="label">{label}:</label>
    <div className="control">
      <div className="select is-fullwidth">
        <select id={id} onChange={onValueChange} defaultValue={currentValueLabel}>
          {options.map(({/*value,*/ label}, index) =>
            <option key={index}>{label}</option>
          )}
        </select>
      </div>
    </div>
  </div>;
}
