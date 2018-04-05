// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape} from 'react-intl';

import PermissionCheckbox from './permission_checkbox.jsx';

export class PermissionRow extends React.Component {
    static propTypes = {
        intl: intlShape.isRequired,
        code: PropTypes.string.isRequired,
        inherited: PropTypes.object,
        readOnly: PropTypes.bool,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    toggleSelect = () => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onChange(this.props.code);
    }

    render = () => {
        const {code, inherited, value} = this.props;
        return (
            <div
                className={'permission-row ' + (this.props.readOnly ? 'read-only' : '')}
                onClick={this.toggleSelect}
            >
                <PermissionCheckbox value={value}/>
                <span className='permission-name'>
                    <FormattedMessage id={'admin.permissions.permission.' + code + '.name'}/>
                </span>
                {inherited &&
                    <span className='permission-description'>
                        <FormattedHTMLMessage
                            id='admin.permissions.inherited_from'
                            values={{
                                ref: inherited.name,
                                name: this.props.intl.formatMessage({
                                    id: 'admin.permissions.roles.' + inherited.name + '.name',
                                    defaultMessage: inherited.display_name,
                                }),
                            }}
                        />
                    </span>}
                {!inherited &&
                    <span className='permission-description'>
                        <FormattedMessage id={'admin.permissions.permission.' + code + '.description'}/>
                    </span>}
            </div>
        );
    };
}

export default injectIntl(PermissionRow);
