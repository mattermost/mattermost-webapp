// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';
interface InputBusinessEmailProps {
    email: string;
    handleEmailValues: (e: React.ChangeEvent<HTMLInputElement>) => void;
    customInputLabel: {type: 'info' | 'error' | 'warning' | 'ok'; value: string} | null;
}

const InputBusinessEmail = ({
    email,
    handleEmailValues,
    customInputLabel,
}: InputBusinessEmailProps): JSX.Element => {
    const {formatMessage} = useIntl();

    return (
        <Input
            type='email'
            autoComplete='off'
            autoFocus={true}
            required={true}
            value={email}
            name='new-channel-modal-name'
            containerClassName='new-channel-modal-name-container'
            inputClassName='new-channel-modal-name-input'
            label={formatMessage({id: 'start_cloud_trial.modal.enter_trial_email.input.label', defaultMessage: 'Enter business email'})}
            placeholder={formatMessage({id: 'start_cloud_trial.modal.enter_trial_email.input.placeholder', defaultMessage: 'name@companyname.com'})}
            onChange={handleEmailValues}
            customMessage={customInputLabel}
        />
    );
};

export default InputBusinessEmail;
