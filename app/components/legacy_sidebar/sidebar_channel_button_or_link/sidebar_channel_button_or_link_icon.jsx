// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import Svg from 'react-inlinesvg';

import {Constants} from 'utils/constants';

import ArchiveIcon from 'components/widgets/icons/archive_icon';
import DraftIcon from 'components/widgets/icons/draft_icon';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import StatusIcon from 'components/status_icon';
import BotIcon from 'components/widgets/icons/bot_icon.jsx';

export default class SidebarChannelButtonOrLinkIcon extends React.PureComponent {
    static propTypes = {
        botIconUrl: PropTypes.string,
        channelIsArchived: PropTypes.bool.isRequired,
        channelType: PropTypes.string.isRequired,
        channelStatus: PropTypes.string,
        hasDraft: PropTypes.bool.isRequired,
        membersCount: PropTypes.number,
        teammateId: PropTypes.string,
        teammateDeletedAt: PropTypes.number,
        teammateIsBot: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            svgErrorUrl: null,
        };
    }

    onSvgLoadError = () => {
        this.setState({
            svgErrorUrl: this.props.botIconUrl,
        });
    }

    onSvgLoad = () => {
        this.setState({
            svgErrorUrl: null,
        });
    }

    render() {
        let icon = null;
        if (this.props.channelIsArchived) {
            icon = (
                <ArchiveIcon className='icon icon__archive'/>
            );
        } else if (this.props.hasDraft) {
            icon = (
                <DraftIcon className='icon icon__draft'/>
            );
        } else if (this.props.channelType === Constants.OPEN_CHANNEL) {
            icon = (
                <GlobeIcon className='icon icon__globe'/>
            );
        } else if (this.props.channelType === Constants.PRIVATE_CHANNEL) {
            icon = (
                <LockIcon className='icon icon__lock'/>
            );
        } else if (this.props.channelType === Constants.GM_CHANNEL) {
            icon = <div className='status status--group'>{this.props.membersCount}</div>;
        } else if (this.props.channelType === Constants.DM_CHANNEL) {
            if (this.props.teammateId && this.props.teammateDeletedAt) {
                icon = (
                    <ArchiveIcon className='icon icon__archive'/>
                );
            } else if (this.props.teammateId && this.props.teammateIsBot) {
                // Use default bot icon
                icon = (<BotIcon className='icon icon__bot'/>);

                // Attempt to display custom icon if botIconUrl has changed
                // or if there was no error when loading custom svg
                if (this.props.botIconUrl &&
                    this.props.botIconUrl !== this.state.svgErrorUrl) {
                    icon = (
                        <span
                            className='icon icon__bot'
                        >
                            <Svg
                                src={this.props.botIconUrl}
                                onLoad={this.onSvgLoad}
                                onError={this.onSvgLoadError}
                            />
                        </span>
                    );
                }
            } else {
                icon = (
                    <StatusIcon
                        type='avatar'
                        status={this.props.channelStatus}
                    />
                );
            }
        }
        return icon;
    }
}
