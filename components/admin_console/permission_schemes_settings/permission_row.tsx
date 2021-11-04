// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import PermissionCheckbox from './permission_checkbox.jsx';
import PermissionDescription from './permission_description.jsx';

type Props = {
    id: string;
    uniqId: string;
    inherited?: Record<string, string>;
    readOnly?: boolean;
    selected?: string;
    selectRow: () => void;
    value: string;
    onChange: (id: string) => void;
    additionalValues?: Record<string, React.ReactNode>;
}

export default class PermissionRow extends React.PureComponent<Props> {
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
