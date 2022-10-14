// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import AppsForm from 'components/apps_form';
import {AppForm} from '@mattermost/types/apps';

import {CommonProps} from './common_props';

export function AppBindingButton(props: CommonProps) {
    const form: AppForm = {
        fields: [
            {
                name: 'submit',
                type: 'static_select',
                options: [
                    {
                        label: props.binding.label,
                        value: props.binding.label,
                    },
                ],
            },
        ],
        submit_buttons: 'submit',
        submit: props.binding.submit,
    };

    return (
        <div style={styles.containerSpacing}>
            <AppsForm
                hideCancel={true}
                isEmbedded={true}
                onExited={() => {
                    alert('exited');
                }}
                context={props.context}
                form={form}
            />
        </div>
    );
}

const styles = {
    containerSpacing: {
        paddingLeft: '20px',
        paddingRight: '20px',
    },
};
