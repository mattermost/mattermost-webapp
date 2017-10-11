// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import {getSiteURL} from 'utils/url.jsx';
import * as Utils from 'utils/utils.jsx';

export default class ChannelInfoModal extends React.PureComponent {
    static propTypes = {

        /**
         * Function that is called when modal is hidden
         */
        onHide: PropTypes.func.isRequired,

        /**
         * Channel object
         */
        channel: PropTypes.object.isRequired,

        /**
         * Current team object
         */
        currentTeam: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.onHide = this.onHide.bind(this);

        this.state = {show: true};
    }

    onHide() {
        this.setState({show: false});
    }

    render() {
        let channel = this.props.channel;
        let channelIcon;
        const globeIcon = Constants.GLOBE_ICON_SVG;
        const lockIcon = Constants.LOCK_ICON_SVG;

        if (!channel) {
            const notFound = Utils.localizeMessage('channel_info.notFound', 'No Channel Found');

            channel = {
                display_name: notFound,
                name: notFound,
                purpose: notFound,
                header: notFound,
                id: notFound
            };
        }

        if (channel.type === 'O') {
            channelIcon = (
                <span
                    className='icon icon__globe icon--body'
                    dangerouslySetInnerHTML={{__html: globeIcon}}
                />
            );
        } else if (channel.type === 'P') {
            channelIcon = (
                <span
                    className='icon icon__globe icon--body'
                    dangerouslySetInnerHTML={{__html: lockIcon}}
                />
            );
        }

        const channelURL = getSiteURL() + '/' + this.props.currentTeam.name + '/channels/' + channel.name;

        let channelPurpose;
        if (channel.purpose) {
            channelPurpose = channel.purpose;
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            channelPurpose = (
                <FormattedMessage
                    id='default_channel.purpose'
                    defaultMessage='Post messages here that you want everyone to see. Everyone automatically becomes a permanent member of this channel when they join the team.'
                />
            );
        }

        let channelPurposeElement;
        if (channelPurpose) {
            channelPurposeElement = (
                <div className='form-group'>
                    <div className='info__label'>
                        <FormattedMessage
                            id='channel_info.purpose'
                            defaultMessage='Purpose:'
                        />
                    </div>
                    <div className='info__value'>{channelPurpose}</div>
                </div>
            );
        }

        let channelHeader = null;
        if (channel.header) {
            channelHeader = (
                <div className='form-group'>
                    <div className='info__label'>
                        <FormattedMessage
                            id='channel_info.header'
                            defaultMessage='Header:'
                        />
                    </div>
                    <div
                        className='info__value'
                        dangerouslySetInnerHTML={{__html: TextFormatting.formatText(channel.header, {singleline: false, mentionHighlight: false})}}
                    />
                </div>
            );
        }

        return (
            <Modal
                dialogClassName='about-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='channel_info.about'
                            defaultMessage='About'
                        />
                        <strong>{channelIcon}{channel.display_name}</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref='modalBody'>
                    {channelPurposeElement}
                    {channelHeader}
                    <div className='form-group'>
                        <div className='info__label'>
                            <FormattedMessage
                                id='channel_info.url'
                                defaultMessage='URL:'
                            />
                        </div>
                        <div className='info__value'>{channelURL}</div>
                    </div>
                    <div className='about-modal__hash form-group padding-top x2'>
                        <p>
                            <FormattedMessage
                                id='channel_info.id'
                                defaultMessage='ID: '
                            />
                            {channel.id}
                        </p>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
