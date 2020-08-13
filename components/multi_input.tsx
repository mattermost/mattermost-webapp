// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import ReactSelect, {components, Props as SelectProps} from 'react-select';
import classNames from 'classnames';

type Props = SelectProps & {
    value: {label: string; value: string}[];
    legend?: string;
}

const MultiValueContainer = (props: any) => {
    return (
        <div className={classNames('InviteMembersStep__emailContainer', {error: props.data.error})}>
            <components.MultiValueContainer {...props}/>
        </div>
    );
};

const MultiValueRemove = (props: any) => {
    return (
        <div className='InviteMembersStep__removeEmailButton'>
            <components.MultiValueRemove {...props}>
                <i className='icon icon-close-circle'/>
            </components.MultiValueRemove>
        </div>
    );
};

const MultiInput: React.FC<Props> = (props: Props) => {
    const {value, placeholder, className, addon, name, textPrefix, legend, ...otherProps} = props;

    const [focused, setFocused] = useState(false);

    const onInputFocus = (event: React.FocusEvent<HTMLElement>) => {
        const {onFocus} = props;

        setFocused(true);

        if (onFocus) {
            onFocus(event);
        }
    };

    const onInputBlur = (event: React.FocusEvent<HTMLElement>) => {
        const {onBlur} = props;

        setFocused(false);

        if (onBlur) {
            onBlur(event);
        }
    };

    let inputClass = className ? `Input ${className}` : 'Input';
    let fieldsetClass = className ? `Input_fieldset ${className}` : 'Input_fieldset';
    const showLegend = Boolean(focused || value.length);

    inputClass = showLegend ? inputClass + ' Input___focus' : inputClass;
    fieldsetClass = showLegend ? fieldsetClass + ' Input_fieldset___legend' : fieldsetClass;

    return (
        <div className='Input_container'>
            {/* <fieldset className={error || hasError ? fieldsetErrorClass : fieldsetClass}> */}
            <fieldset className={fieldsetClass}>
                <legend className={showLegend ? 'Input_legend Input_legend___focus' : 'Input_legend'}>{showLegend ? (legend || placeholder) : null}</legend>
                <div className='Input_wrapper'>
                    {textPrefix && <span>{textPrefix}</span>}
                    <ReactSelect
                        id={`MultiInput_${name}`}
                        components={{
                            Menu: () => null,
                            IndicatorsContainer: () => null,
                            MultiValueContainer,
                            MultiValueRemove,
                        }}
                        isMulti={true}
                        isClearable={false}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                        openMenuOnFocus={false}
                        menuIsOpen={false}
                        placeholder={focused ? '' : placeholder}
                        className={inputClass}
                        value={value}
                        {...otherProps}
                    />
                </div>
                {addon}
            </fieldset>
        </div>
    );
};

export default MultiInput;