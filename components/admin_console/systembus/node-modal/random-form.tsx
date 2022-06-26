// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';
type Props = {
    handleChange: (data: Record<string, any>) => void;
}
const RandomOptionsForm = ({handleChange}: Props): JSX.Element => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [randomOptions, setRandomOptions] = useState('');

    const onChange = ({target: {value: data}}: React.ChangeEvent<HTMLInputElement>) => {
        setRandomOptions(data);
        handleChange({randomOptions: Number(data)});
    };

    return (
        <Input
            type='number'
            name='node-modal-name'
            containerClassName='node-modal-name-container'
            inputClassName='node-modal-name-input'
            label={formatMessage({id: 'node_modal.name.label', defaultMessage: 'Random Options'})}
            placeholder={formatMessage({id: 'node_modal.name.placeholder', defaultMessage: 'Random Options'})}
            onChange={onChange}
            value={randomOptions}
            data-testid='nameInput'
            maxLength={64}
            autoFocus={true}
        />
    );
};

export default RandomOptionsForm;
