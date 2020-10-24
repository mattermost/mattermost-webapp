// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {MouseEventHandler} from 'react';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {isMobile} from 'utils/utils.jsx';

import {Value} from 'components/multiselect/multiselect';

import Timestamp from 'components/timestamp';

import AddIcon from 'components/widgets/icons/fa_add_icon';

import {TIME_SPEC} from './more_direct_channels';

type Props = {
    channel: (Channel & Value & {profiles: UserProfile[]});
    isSelected: boolean;
    onClick: MouseEventHandler;
    onMouseEnter?: MouseEventHandler,
    selectedItemRef: React.RefObject<HTMLDivElement>;
}

export default class GroupMessageOption extends React.PureComponent<Props> {
    static propTypes = {

    };

    getStyle() {
        let className = 'mentions__name';
        if (this.props.isSelected) {
            className += ' more-modal__row--selected';
        }
        return className;
    }

    displayName() {
        return this.props.channel.profiles.map((profile) => '@' + profile.username).join(', ');
    }

    render() {
        const {
            channel: {
                id,
                last_post_at: lastPostAt,
            },
            isSelected,
            onClick,
            onMouseEnter,
            selectedItemRef,
        } = this.props;
        return (
            <div
                key={id}
                className={'more-modal__row clickable ' + this.getStyle()}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                ref={isSelected ? selectedItemRef : id}
            >
                <div className='more-modal__gm-icon bg-text-200'>
                    {this.props.channel.profiles.length}
                </div>
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {this.displayName()}
                    </div>
                </div>
                {!isMobile() && Boolean(lastPostAt) &&
                    <div className='more-modal__lastPostAt'>
                        <Timestamp
                            {...TIME_SPEC}
                            value={lastPostAt}
                        />
                    </div>
                }
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <AddIcon/>
                    </div>
                </div>
            </div>
        );
    }
}
