// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, useState} from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';
import system from '../../../../reducers/views/system';
import {SearchUserTeamFilter, UserFilters} from '../../../../utils/constants';
import * as Utils from '../../../../utils/utils';
import systembus from '../systembus';
type Props = {
    handleChange: (data: Record<string, any>) => void;
}
const WebhookForm = ({handleChange}: Props): JSX.Element => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [data, setData] = useState<{ifValue: string;ifComparison: string}>({ifValue: '', ifComparison: ''});

    const handleIfValueOnChange = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            ifValue: value,
        });
        handleChange(data);
    };

    const handleIfComparisonOnChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setData({
            ...data,
            ifComparison: e.target.value,
        });
        handleChange(data);
    };

    return (
        <div className='node-modal__column'>
            <Input
                type='text'
                name='node-modal-name'
                containerClassName='node-modal-name-container'
                inputClassName='node-modal-name-input'
                label={formatMessage({id: 'node_modal.name.label', defaultMessage: 'ifValue'})}
                placeholder={formatMessage({id: 'node_modal.name.placeholder', defaultMessage: 'ifValue'})}
                onChange={handleIfValueOnChange}
                value={data.ifValue}
                data-testid='nameInput'
                maxLength={64}
                autoFocus={true}
            />
            <select
                id='selectComparison'
                className='node-modal__select'
                value={data.ifComparison}
                onChange={handleIfComparisonOnChange}
            >
                <option value='eq'>{'eq'}</option>
                <option value='gt'>{'gt'}</option>
                <option value='lt'>{'lt'}</option>
                <option value='gte'>{'gte'}</option>
                <option value='lte'>{'lte'}</option>
                <option value='contains'>{'contains'}</option>
                <option value='prefix'>{'prefix'}</option>
                <option value='suffix'>{''}</option>
            </select>
        </div>
    );
};

export default WebhookForm;
