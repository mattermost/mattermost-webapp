// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import DropdownSetting from './dropdown_setting.jsx';

import {CONNECTION_SECURITY_HELP_TEXT_EMAIL} from './admin_definition_constants';

export function ConnectionSecurityDropdownSettingEmail(props) {
    return (
        <DropdownSetting
            id='connectionSecurity'
            values={[
                {value: '', text: Utils.localizeMessage('admin.connectionSecurityNone', 'None')},
                {value: 'TLS', text: Utils.localizeMessage('admin.connectionSecurityTls', 'TLS (Recommended)')},
                {value: 'STARTTLS', text: Utils.localizeMessage('admin.connectionSecurityStart')},
            ]}
            label={
                <FormattedMessage
                    id='admin.connectionSecurityTitle'
                    defaultMessage='Connection Security:'
                />
            }
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
            helpText={CONNECTION_SECURITY_HELP_TEXT_EMAIL}
            setByEnv={props.setByEnv}
        />
    );
}
ConnectionSecurityDropdownSettingEmail.defaultProps = {
};

ConnectionSecurityDropdownSettingEmail.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    setByEnv: PropTypes.bool.isRequired,
};
