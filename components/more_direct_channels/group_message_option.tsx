// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {Value} from 'components/multiselect/multiselect';

import AddIcon from 'components/widgets/icons/fa_add_icon';

type Props = {
    channel: (Channel & Value & {profiles: UserProfile[]});
    isSelected: boolean;
    onAdd: (users: UserProfile[]) => void;
    selectedItemRef: React.RefObject<HTMLDivElement>;
}

export default class GroupMessageOption extends React.PureComponent<Props> {
    static propTypes = {

    };

    getStyle() {
        let className = 'mentions__name';
        if (this.props.isSelected) {
            className += ' suggestion--selected';
        }
        return className;
    }

    displayName() {
        return this.props.channel.profiles.map((profile) => '@' + profile.username).join(', ');
    }

    addValue = () => {
        this.props.onAdd(this.props.channel.profiles);
    }

    render() {
        return (
            <div
                key={this.props.channel.id}
                className={'more-modal__row clickable ' + this.getStyle()}
                onClick={this.addValue}
                ref={this.props.isSelected ? this.props.selectedItemRef : this.props.channel.id}
            >
                <div className='more-modal__gm-icon bg-text-200'>
                    {this.props.channel.profiles.length}
                </div>
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {this.displayName()}
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <AddIcon/>
                    </div>
                </div>
            </div>
        );
    }
}
