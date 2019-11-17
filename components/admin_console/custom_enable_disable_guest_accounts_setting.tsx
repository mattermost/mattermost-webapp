// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import ConfirmModal from 'components/confirm_modal.jsx';

import BooleanSetting from './boolean_setting';

type Props = {
    id: string;
    value: boolean;
    onChange: (id: string, value: any) => void;
    disabled?: boolean;
    setByEnv: boolean;
}

type State = {
    showConfirm: boolean;
}

export default class CustomEnableDisableGuestAccountsSetting extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            showConfirm: false,
        };
    }

    public handleChange = (id: string, value: boolean, confirm?: boolean) => {
        if (!value && !confirm) {
            this.setState({showConfirm: true});
        } else {
            this.props.onChange(id, value);
        }
    };

    public render() {
        const label = (
            <FormattedMessage
                id='admin.guest_access.enableTitle'
                defaultMessage='Enable Guest Access: '
            />
        );
        const helpText = (
            <FormattedMarkdownMessage
                id='admin.guest_access.enableDescription'
                defaultMessage='When true, external guest can be invited to channels within teams. Please see [Permissions Schemes](../user_management/permissions/system_scheme) for which roles can invite guests.'
            />
        );

        return (
            <>
                <BooleanSetting
                    id={this.props.id}
                    value={this.props.value}
                    label={label}
                    helpText={helpText}
                    setByEnv={this.props.setByEnv}
                    onChange={this.handleChange}
                />
                <ConfirmModal
                    show={this.state.showConfirm}
                    title={
                        <FormattedMessage
                            id='admin.guest_access.disableConfirmTitle'
                            defaultMessage='Disable Guest Access?'
                        />
                    }
                    message={
                        <FormattedMessage
                            id='admin.guest_access.disableConfirmMessage'
                            defaultMessage='Disabling guest access will revoke all current Guest Account sessions. Guests will no longer be able to login and new guests cannot be invited into Mattermost. Guest users will be marked as inactive in user lists. Enabling this feature will not reinstate previous guest accounts.'
                        />
                    }
                    confirmButtonText={
                        <FormattedMessage
                            id='admin.guest_access.disableConfirmButton'
                            defaultMessage='Disable Guest Access'
                        />
                    }
                    onConfirm={() => {
                        this.handleChange(this.props.id, false, true);
                        this.setState({showConfirm: false});
                    }}
                    onCancel={() => this.setState({showConfirm: false})}
                />
            </>
        );
    }
}
