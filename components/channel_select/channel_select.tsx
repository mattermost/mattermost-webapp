// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

type Props = {
    channels: Array<{
        id: string;
        display_name?: string;
        name: string;
        type: string;
    }>;
    onChange: () => void;
    value: string;
    selectOpen: boolean;
    selectPrivate: boolean;
    selectDm: boolean;
};

type OptionsState = Array<{
    key: string;
    value: string;
    text: string;
}>;

function ChannelSelect({
    channels,
    onChange,
    value,
    selectOpen = false,
    selectPrivate = false,
    selectDm = false,
}: Props): JSX.Element {
    const [options, setOptions] = useState<OptionsState>([
        {
            key: '',
            value: '',
            text: Utils.localizeMessage('channel_select.placeholder', '--- Select a channel ---'),
        },
    ]);

    useEffect(() => {
        channels.forEach((channel) => {
            const channelName = channel.display_name || channel.name;
            if (channel.type === Constants.OPEN_CHANNEL && selectOpen) {
                setOptions([
                    ...options,
                    {
                        key: channel.id,
                        value: channel.id,
                        text: channelName,
                    },
                ]);
            } else if (channel.type === Constants.PRIVATE_CHANNEL && selectPrivate) {
                setOptions([
                    ...options,
                    {
                        key: channel.id,
                        value: channel.id,
                        text: channelName,
                    },
                ]);
            } else if (channel.type === Constants.DM_CHANNEL && selectDm) {
                setOptions([
                    ...options,
                    {
                        key: channel.id,
                        value: channel.id,
                        text: channelName,
                    },
                ]);
            }
        });
    }, []);

    return (
        <select
            className='form-control'
            value={value}
            onChange={onChange}
            id='channelSelect'
        >
            {options.map((option) => (
                <option
                    key={option.key}
                    value={option.value}
                >
                    {option.text}
                </option>),
            )}
        </select>
    );
}

export default ChannelSelect;
