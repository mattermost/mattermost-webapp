// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import Creatable from 'react-select/lib/Creatable';
import {components} from 'react-select';
import {FormattedMessage} from 'react-intl';

import {isEmail} from 'mattermost-redux/utils/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import MailIcon from 'components/svg/mail_icon';
import MailPlusIcon from 'components/svg/mail_plus_icon';

import {t} from 'utils/i18n.jsx';

import './emails_input.scss';

export default class EmailsInput extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        value: PropTypes.arrayOf(PropTypes.string),
        noOptionsMessageId: PropTypes.string,
        noOptionsMessageDefault: PropTypes.string,
        validAddressMessageId: PropTypes.string,
        validAddressMessageDefault: PropTypes.string,
    }

    static defaultProps = {
        noOptionsMessageId: t('widgets.emails_input.invalid_email'),
        noOptionsMessageDefault: 'Type email address',
        validAddressMessageId: t('widgets.emails_input.valid_email'),
        validAddressMessageDefault: 'Add **{email}**',
    };

    getCreateLabel = (value) => (
        <React.Fragment>
            <MailPlusIcon className='mail-plus-icon'/>
            <FormattedMarkdownMessage
                key='widgets.emails_input.valid_email'
                id={this.props.validAddressMessageId}
                defaultMessage={this.props.validAddressMessageDefault}
                values={{email: value}}
            />
        </React.Fragment>
    );

    NoOptionsMessage = (props) => {
        return (
            <components.NoOptionsMessage {...props}>
                <FormattedMessage
                    id={this.props.noOptionsMessageId}
                    defaultMessage={this.props.noOptionsMessageDefault}
                />
            </components.NoOptionsMessage>
        );
    }

    MultiValueLabel = (props) => (
        <React.Fragment>
            <MailIcon className='mail-icon'/>
            <components.MultiValueLabel {...props}/>
        </React.Fragment>
    );

    components = {
        NoOptionsMessage: this.NoOptionsMessage,
        IndicatorsContainer: () => null,
        MultiValueLabel: this.MultiValueLabel,
    };

    onChange = (value) => {
        if (this.props.onChange) {
            this.props.onChange(value.map((v) => v.value));
        }
    }

    render() {
        const values = this.props.value.map((v) => ({label: v, value: v}));
        return (
            <Creatable
                styles={this.customStyles}
                onChange={this.onChange}
                isMulti={true}
                isClearable={false}
                isValidNewOption={isEmail}
                formatCreateLabel={this.getCreateLabel}
                className='EmailsInput'
                classNamePrefix='emails-input'
                placeholder={this.props.placeholder}
                components={this.components}
                value={values}
            />
        );
    }
}
