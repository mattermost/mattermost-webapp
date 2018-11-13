// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import GlobeIcon from 'components/svg/globe_icon';
import LockIcon from 'components/svg/lock_icon';

export default class GroupTeamsAndChannelsRow extends React.PureComponent {
    static propTypes = {
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        hasChildren: PropTypes.bool,
        collapsed: PropTypes.bool,
    }

    render = () => {
        let extraClasses = '';
        let arrowIcon = null;
        if (this.props.hasChildren) {
            arrowIcon = (
                <i className={'fa fa-caret-right' + (this.props.collapsed ? '' : ' open')}/>
            );
            extraClasses += ' has-clidren';
        }

        if (this.props.collapsed) {
            extraClasses += ' collapsed';
        }

        let teamIcon = null;
        let channelIcon = null;
        switch (this.props.type) {
        case 'public-team':
            teamIcon = (
                <div className='team-icon'>
                    <LockIcon className='icon icon__lock'/>
                </div>
            );
            break;
        case 'private-team':
            teamIcon = (
                <div className='team-icon'>
                    <GlobeIcon className='icon icon__globe'/>
                </div>
            );
            break;
        default:
            teamIcon = (<div className='team-icon'/>);
        }

        switch (this.props.type) {
        case 'public-channel':
            channelIcon = (
                <div className='channel-icon'>
                    <LockIcon className='icon icon__lock'/>
                </div>
            );
            break;
        case 'private-channel':
            channelIcon = (
                <div className='channel-icon'>
                    <GlobeIcon className='icon icon__globe'/>
                </div>
            );
            break;
        }

        return (
            <div className={'group-teams-and-channels-row' + extraClasses}>
                <div className='arrow-icon'>
                    {arrowIcon}
                </div>
                {teamIcon}
                {channelIcon}
                <div className='name'>
                    {this.props.name}
                </div>
                <div className='remove'>
                    <button className='btn btn-link'>
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_teams_and_channels_row.remove'
                            defaultMessage='Remove'
                        />
                    </button>
                </div>
            </div>
        );
    };
}
