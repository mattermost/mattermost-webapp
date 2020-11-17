// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import PermissionCheckbox from './permission_checkbox.jsx';
import PermissionDescription from './permission_description.jsx';

export default class PermissionRow extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        uniqId: PropTypes.string.isRequired,
        inherited: PropTypes.object,
        readOnly: PropTypes.bool,
        selected: PropTypes.string,
        selectRow: PropTypes.func.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        additionalValues: PropTypes.object,
    };

    toggleSelect = () => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onChange(this.props.id);
    }

    render = () => {
        const {id, uniqId, inherited, value, readOnly, selected, additionalValues} = this.props;
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
                id={uniqId}
            >
                <PermissionCheckbox
                    value={value}
                    id={`${uniqId}-checkbox`}
                />
                <span className='permission-name'>
                    <FormattedMessage
                        id={'admin.permissions.permission.' + id + '.name'}
                    />
                </span>
                <PermissionDescription
                    inherited={inherited}
                    id={id}
                    selectRow={this.props.selectRow}
                    rowType='permission'
                    additionalValues={additionalValues}
                />
            </div>
        );
    };
}
