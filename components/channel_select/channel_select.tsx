// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from 'mattermost-redux/src/types/channels';
import React, {useEffect, useState} from 'react';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

type Props = {
    channels: Channel[];
    onChange: () => void;
    value: string;
    selectOpen: boolean;
    selectPrivate: boolean;
    selectDm: boolean;
};

const ChannelSelect = ({
    channels,
    onChange,
    value,
    selectOpen = false,
    selectPrivate = false,
    selectDm = false,
}: Props) => {
    const [options, setOptions] = useState([
        <option
            key=''
            value=''
        >
            {Utils.localizeMessage('channel_select.placeholder', '--- Select a channel ---')}
        </option>,
    ]);

    useEffect(() => {
        channels.forEach((channel) => {
            const channelName = channel.display_name || channel.name;
            if (channel.type === Constants.OPEN_CHANNEL && selectOpen) {
                setOptions([...options,
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channelName}
                    </option>,
                ]);
            } else if (channel.type === Constants.PRIVATE_CHANNEL && selectPrivate) {
                setOptions([...options,
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channelName}
                    </option>,
                ]);
            } else if (channel.type === Constants.DM_CHANNEL && selectDm) {
                setOptions([...options,
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channelName}
                    </option>,
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
            {options}
        </select>
    );
};

export default ChannelSelect;
