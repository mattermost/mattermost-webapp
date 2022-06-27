// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';

type Props = {
    handleChange: (data: Record<string, any>) => void;
}

const CronForm = ({handleChange}: Props): JSX.Element => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [cron, setCron] = useState<string>('');

    const handleIfValueOnChange = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setCron(value);
        handleChange({cron});
    };

    return (
        <div className='node-modal__column'>
            <Input
                type='text'
                name='node-modal-name'
                containerClassName='node-modal-name-container'
                inputClassName='node-modal-name-input'
                label={formatMessage({id: 'node_modal.name.cron.label', defaultMessage: 'cron'})}
                placeholder={formatMessage({id: 'node_modal.name.cron.placeholder', defaultMessage: 'cron'})}
                onChange={handleIfValueOnChange}
                value={cron}
                data-testid='nameInput'
                maxLength={64}
                autoFocus={true}
            />
        </div>
    );
};

export default CronForm;
