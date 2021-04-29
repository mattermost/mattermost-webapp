// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {MobileChannelHeaderDropdown} from 'components/channel_header_dropdown';
import MobileChannelHeaderPlug from 'plugins/mobile_channel_header_plug';

import * as Utils from 'utils/utils';

import CollapseLhsButton from './collapse_lhs_button';
import CollapseRhsButton from './collapse_rhs_button';
import ChannelInfoButton from './channel_info_button';
import ShowSearchButton from './show_search_button';
import UnmuteChannelButton from './unmute_channel_button';

export default class ChannelHeaderMobile extends React.PureComponent {
    static propTypes = {

        /**
         *
         */
        user: PropTypes.object.isRequired,

        /**
         * Object with info about current channel
         */
        channel: PropTypes.object,

        /**
         * Bool whether the current channel is read only
         */
        isReadOnly: PropTypes.bool,

        /**
         * Bool whether the current channel is muted
         */
        isMuted: PropTypes.bool,

        /**
         * Bool whether the right hand side is open
         */
        isRHSOpen: PropTypes.bool,

        /**
         * Relative url for the team, used to redirect if a link in the channel header is clicked
         */
        currentRelativeTeamUrl: PropTypes.string,

        inGlobalThreads: PropTypes.bool,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({
            closeLhs: PropTypes.func.isRequired,
            closeRhs: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
        }).isRequired,

    };

    componentDidMount() {
        document.querySelector('.inner-wrap').addEventListener('click', this.hideSidebars);
    }

    componentWillUnmount() {
        document.querySelector('.inner-wrap').removeEventListener('click', this.hideSidebars);
    }

    hideSidebars = (e) => {
        if (Utils.isMobile()) {
            this.props.actions.closeRhs();

            if (e.target.className !== 'navbar-toggle' && e.target.className !== 'icon-bar') {
                this.props.actions.closeLhs();
                this.props.actions.closeRhsMenu();
            }
        }
    }

    render() {
        const {user, channel, isMuted, isReadOnly, isRHSOpen, currentRelativeTeamUrl, inGlobalThreads} = this.props;

        let heading;
        if (inGlobalThreads) {
            heading = (
                <FormattedMessage
                    id='globalThreads.heading'
                    defaultMessage='Followed threads'
                />
            );
        } else if (channel) {
            heading = (
                <>
                    <MobileChannelHeaderDropdown/>
                    {isMuted && (
                        <UnmuteChannelButton
                            user={user}
                            channel={channel}
                        />
                    )}
                </>
            );
        }

        return (
            <nav
                id='navbar'
                className='navbar navbar-default navbar-fixed-top'
                role='navigation'
            >
                <div className='container-fluid theme'>
                    <div className='navbar-header'>
                        <CollapseLhsButton/>
                        <div className={classNames('navbar-brand', {GlobalThreads___title: inGlobalThreads})}>
                            {heading}
                        </div>
                        <div className='spacer'/>
                        {channel && (
                            <ChannelInfoButton
                                channel={channel}
                                isReadOnly={isReadOnly}
                                isRHSOpen={isRHSOpen}
                                currentRelativeTeamUrl={currentRelativeTeamUrl}
                            />
                        )}
                        <ShowSearchButton/>
                        {channel && (
                            <MobileChannelHeaderPlug
                                channel={channel}
                                isDropdown={false}
                            />
                        )}
                        <CollapseRhsButton/>
                    </div>
                </div>
            </nav>
        );
    }
}
