// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape} from 'react-intl';

import PermissionCheckbox from './permission_checkbox.jsx';

export class PermissionRow extends React.Component {
    static propTypes = {
        intl: intlShape.isRequired,
        id: PropTypes.string.isRequired,
        inherited: PropTypes.object,
        readOnly: PropTypes.bool,
        selected: PropTypes.string,
        selectRow: PropTypes.func.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    toggleSelect = () => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onChange(this.props.id);
    }

    parentPermissionClicked = (e) => {
        if (e.target.tagName === 'A') {
            this.props.selectRow(this.props.id);
        }
    }

    render = () => {
        const {id, inherited, value, readOnly, selected} = this.props;
        let classes = 'permission-row';
        if (readOnly) {
            classes += ' read-only';
        }

        if (selected === id) {
            classes += ' selected';
        }

        return (
            <div
                className={classes}
                onClick={this.toggleSelect}
            >
                <PermissionCheckbox value={value}/>
                <span className='permission-name'>
                    <FormattedMessage id={'admin.permissions.permission.' + id + '.name'}/>
                </span>
                {inherited &&
                    <span
                        className='permission-description'
                        onClick={this.parentPermissionClicked}
                    >
                        <FormattedHTMLMessage
                            id='admin.permissions.inherited_from'
                            values={{
                                name: this.props.intl.formatMessage({
                                    id: 'admin.permissions.roles.' + inherited.name + '.name',
                                    defaultMessage: inherited.display_name,
                                }),
                            }}
                        />
                    </span>}
                {!inherited &&
                    <span className='permission-description'>
                        <FormattedMessage id={'admin.permissions.permission.' + id + '.description'}/>
                    </span>}
            </div>
        );
    };
}

export default injectIntl(PermissionRow);
