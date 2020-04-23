// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import Markdown from 'components/markdown';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import ArchiveIcon from 'components/widgets/icons/archive_icon';

import Constants from 'utils/constants.jsx';
import {getSiteURL} from 'utils/url';
import * as Utils from 'utils/utils.jsx';

const headerMarkdownOptions = {singleline: false, mentionHighlight: false};

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
        currentTeam: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {show: true};

        this.getHeaderMarkdownOptions = memoizeResult((channelNamesMap) => (
            {...headerMarkdownOptions, channelNamesMap}
        ));
    }

    onHide = () => {
        this.setState({show: false});
    }

    render() {
        let channel = this.props.channel;
        const channelIsArchived = channel.delete_at !== 0;
        let channelIcon;

        if (!channel) {
            const notFound = Utils.localizeMessage('channel_info.notFound', 'No Channel Found');

            channel = {
                display_name: notFound,
                name: notFound,
                purpose: notFound,
                header: notFound,
                id: notFound,
            };
        }

        const channelNamesMap = this.props.channel.props && this.props.channel.props.channel_mentions;

        if (channelIsArchived) {
            channelIcon = (
                <ArchiveIcon className='icon icon__archive'/>
            );
        } else if (channel.type === 'O') {
            channelIcon = (
                <GlobeIcon className='icon icon__globe icon--body'/>
            );
        } else if (channel.type === 'P') {
            channelIcon = (
                <LockIcon className='icon icon__globe icon--body'/>
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
                    <div className='info__value'>
                        <Markdown
                            message={channel.header}
                            options={this.getHeaderMarkdownOptions(channelNamesMap)}
                        />
                    </div>
                </div>
            );
        }

        return (
            <Modal
                dialogClassName='a11y__modal about-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                role='dialog'
                aria-labelledby='channelInfoModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='channelInfoModalLabel'
                    >
                        <FormattedMessage
                            id='channel_info.about'
                            defaultMessage='About'
                        />
                        <strong>{channelIcon}{channel.display_name}</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                    <div className='about-modal__hash form-group pt-3'>
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
