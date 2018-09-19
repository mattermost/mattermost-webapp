// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils';

const GroupMessageOption = (props) => {
    const {channel, isSelected, onAdd} = props;

    let className = 'mentions__name';
    if (isSelected) {
        className += ' suggestion--selected';
    }

    const displayName = channel.profiles.map((profile) => '@' + profile.username).join(', ');
    const icon = <div className='status status--group--direct--option'>{channel.profiles.length}</div>;

    const addValue = () => {
        onAdd(channel.profiles);
    };

    return (
        <div
            key={channel.id}
            className={'more-modal__row clickable ' + className}
            onClick={addValue}
        >
            {icon}
            <div
                className='more-modal__details'
            >
                <div className='more-modal__name'>
                    {displayName}
                </div>
            </div>
            <div className='more-modal__actions'>
                <div className='more-modal__actions--round'>
                    <i
                        className='fa fa-plus'
                        title={localizeMessage('generic_icons.add', 'Add Icon')}
                    />
                </div>
            </div>
        </div>

    );
};

GroupMessageOption.propTypes = {
    channel: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired,
};

export default GroupMessageOption;
