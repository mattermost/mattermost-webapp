// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';
type Props = {
    handleChange: (data: Record<string, any>) => void;
}
const SwitchForm = ({handleChange}: Props): JSX.Element => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [randomOptions, setRandomOptions] = useState('');

    const onChange = ({target: {value: data}}: React.ChangeEvent<HTMLInputElement>) => {
        setRandomOptions(data);
        const dataArray = data.split(',');
        handleChange({caseValues: dataArray});
    };

    return (
        <Input
            type='text'
            name='node-modal-name'
            containerClassName='node-modal-name-container'
            inputClassName='node-modal-name-input'
            label={formatMessage({id: 'node_modal.name.label', defaultMessage: 'Switch (add options seperated by comma)'})}
            placeholder={formatMessage({id: 'node_modal.name.placeholder', defaultMessage: 'Switch (add options seperated by comma)'})}
            onChange={onChange}
            value={randomOptions}
            data-testid='nameInput'
            maxLength={64}
            autoFocus={true}
        />
    );
};

export default SwitchForm;
