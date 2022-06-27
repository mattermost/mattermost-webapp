// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';

type Props = {
    handleChange: (data: Record<string, any>) => void;
}

const inputLabels = [
    'command',
    'description',
    'hint',
    'name',
    'flags',
    'subcommands',
];

const SlashCommandForm = ({handleChange}: Props): JSX.Element => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [data, setData] = useState<any>({
        command: '',
        description: '',
        hint: '',
        name: '',
        flags: '',
        subcommands: '',
    });

    const handleOnChange = (value: string, label: string) => {
        setData({
            ...data,
            [label]: value,
        });
        if (data.command && data.description && data.hint && data.name && data.flags && data.subcommands) {
            handleChange(data);
        }
    };
    return (
        <div className='node-modal__column'>
            {
                inputLabels.map((label) => {
                    return (
                        <Input
                            key={label}
                            type='text'
                            name='node-modal-name'
                            containerClassName='node-modal-name-container'
                            inputClassName='node-modal-name-input'
                            label={formatMessage({id: 'node_modal.name.label', defaultMessage: label})}
                            placeholder={formatMessage({id: 'node_modal.name.placeholder', defaultMessage: label})}
                            onChange={({target: {value}}: React.ChangeEvent<HTMLInputElement>) => handleOnChange(value, label)}
                            value={data[label]}
                            data-testid='nameInput'
                            maxLength={64}
                            autoFocus={label === 'command'}
                        />);
                })
            }
        </div>
    );
};

export default SlashCommandForm;
