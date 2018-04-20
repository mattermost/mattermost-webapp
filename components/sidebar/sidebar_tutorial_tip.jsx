// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedHTMLMessage} from 'react-intl';

import {Constants} from 'utils/constants.jsx';
import TutorialTip from 'components/tutorial/tutorial_tip';

export default class SidebarTutorialTip extends React.PureComponent {
    static propTypes = {
        townSquareDisplayName: PropTypes.string,
        offTopicDisplayName: PropTypes.string,
    }

    render = () => {
        const screens = [];

        let townSquareDisplayName = Constants.DEFAULT_CHANNEL_UI_NAME;
        if (this.props.townSquareDisplayName) {
            townSquareDisplayName = this.props.townSquareDisplayName;
        }

        let offTopicDisplayName = Constants.OFFTOPIC_CHANNEL_UI_NAME;
        if (this.props.offTopicDisplayName) {
            offTopicDisplayName = this.props.offTopicDisplayName;
        }

        screens.push(
            <div>
                <FormattedHTMLMessage
                    id='sidebar.tutorialScreen1'
                    defaultMessage={'<h4>Channels</h4><p><strong>Channels</strong> organize conversations across different topics. They\'re open to everyone on your team. To send private communications use <strong>Direct Messages</strong> for a single person or <strong>Private Channels</strong> for multiple people.</p>'}
                />
            </div>
        );

        screens.push(
            <div>
                <FormattedHTMLMessage
                    id='sidebar.tutorialScreen2'
                    defaultMessage='<h4>"{townsquare}" and "{offtopic}" channels</h4>
                    <p>Here are two public channels to start:</p>
                    <p><strong>{townsquare}</strong> is a place for team-wide communication. Everyone in your team is a member of this channel.</p>
                    <p><strong>{offtopic}</strong> is a place for fun and humor outside of work-related channels. You and your team can decide what other channels to create.</p>'
                    values={{
                        townsquare: townSquareDisplayName,
                        offtopic: offTopicDisplayName,
                    }}
                />
            </div>
        );

        screens.push(
            <div>
                <FormattedHTMLMessage
                    id='sidebar.tutorialScreen3'
                    defaultMessage='<h4>Creating and Joining Channels</h4>
                    <p>Click <strong>"More..."</strong> to create a new channel or join an existing one.</p>
                    <p>You can also create a new public or private channel by clicking the <strong>"+" symbol</strong> next to the public or private channel header.</p>'
                />
            </div>
        );

        return (
            <TutorialTip
                placement='right'
                screens={screens}
                overlayClass='tip-overlay--sidebar'
                diagnosticsTag='tutorial_tip_2_channels'
            />
        );
    }
}

