// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';

import SpinnerButton from 'components/spinner_button';

import {CommonProps} from './common_props';

export function AppBindingButton(props: CommonProps) {
    const [submitting, setSubmitting] = useState(false);
    const {handleBindingClick} = props;

    const onClick = useCallback(async () => {
        setSubmitting(true);

        await handleBindingClick(props.binding);

        setSubmitting(false);
    }, [props.binding, handleBindingClick]);

    const label = props.binding.label;

    return (
        <div style={styles.containerSpacing}>
            <SpinnerButton
                type='submit'
                onClick={onClick}
                autoFocus={false}
                className='btn btn-primary save-button'
                spinning={submitting}
                spinningText={label}
            >
                {label}
            </SpinnerButton>
        </div>
    );
}

const styles = {
    containerSpacing: {
        paddingLeft: '20px',
        paddingRight: '20px',
    },
};
