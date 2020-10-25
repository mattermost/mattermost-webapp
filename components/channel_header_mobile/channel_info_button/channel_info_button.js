// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import Markdown from 'components/markdown';
import OverlayTrigger from 'components/overlay_trigger';
import InfoIcon from 'components/widgets/icons/info_icon';
import Popover from 'components/widgets/popover';
const headerMarkdownOptions = {mentionHighlight: false};

export default class NavbarInfoButton extends React.PureComponent {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        isReadOnly: PropTypes.bool.isRequired,
        isRHSOpen: PropTypes.bool,
        currentRelativeTeamUrl: PropTypes.string,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    headerOverlayRef = React.createRef();

    componentDidUpdate(prevProps) {
        const RHSChanged = !prevProps.isRHSOpen && this.props.isRHSOpen;
        const channelChanged = prevProps.channel?.id !== this.props.channel?.id;
        if (RHSChanged || channelChanged) {
            this.hide();
        }
    }

    showEditChannelHeaderModal = () => {
        this.hide();

        const {actions, channel} = this.props;
        const modalData = {
            modalId: ModalIdentifiers.EDIT_CHANNEL_HEADER,
            dialogType: EditChannelHeaderModal,
            dialogProps: {channel},
        };

        actions.openModal(modalData);
    }

    hide = () => {
        if (this.headerOverlayRef.current) {
            this.headerOverlayRef.current.hide();
        }
    }

    handleFormattedTextClick = (e) => Utils.handleFormattedTextClick(e, this.props.currentRelativeTeamUrl);

    render() {
        const {channel, isReadOnly} = this.props;

        let popoverContent = null;
        if (channel.header) {
            popoverContent = (
                <Markdown
                    message={channel.header}
                    options={headerMarkdownOptions}
                />
            );
        } else {
            let addOne;
            if (!isReadOnly) {
                const link = (
                    <a
                        href='#'
                        onClick={this.showEditChannelHeaderModal}
                    >
                        <FormattedMessage
                            id='navbar.click'
                            defaultMessage='Click here'
                        />
                    </a>
                );
                addOne = (
                    <React.Fragment>
                        <br/>
                        <FormattedMessage
                            id='navbar.clickToAddHeader'
                            defaultMessage='{clickHere} to add one.'
                            values={{clickHere: link}}
                        />
                    </React.Fragment>
                );
            }

            popoverContent = (
                <div>
                    <FormattedMessage
                        id='navbar.noHeader'
                        defaultMessage='No channel header yet.'
                    />
                    {addOne}
                </div>
            );
        }

        const popover = (
            <Popover
                popoverStyle='info'
                placement='bottom'
                className='navbar__popover'
                id='header-popover'
            >
                <span
                    onClick={this.handleFormattedTextClick}
                >
                    {popoverContent}
                </span>

                <div
                    className='close visible-xs-block'
                    onClick={this.hide}
                >
                    {'×'}
                </div>
            </Popover>
        );

        return (
            <OverlayTrigger
                ref={this.headerOverlayRef}
                trigger='click'
                placement='bottom'
                overlay={popover}
                className='description'
                rootClose={true}
            >
                <button
                    className='navbar-toggle navbar-right__icon navbar-info-button pull-right'
                    aria-label={Utils.localizeMessage('accessibility.button.Info', 'Info')}
                >
                    <InfoIcon
                        className='icon icon__info'
                        aria-hidden='true'
                    />
                </button>
            </OverlayTrigger>
        );
    }
}
