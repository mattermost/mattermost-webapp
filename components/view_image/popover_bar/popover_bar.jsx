// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';
import {Constants, ZoomSettings} from 'utils/constants';

export default class PopoverBar extends React.PureComponent {
    static propTypes = {
        fileIndex: PropTypes.number.isRequired,
        totalFiles: PropTypes.number.isRequired,
        filename: PropTypes.string.isRequired,
        fileURL: PropTypes.string.isRequired,
        showPublicLink: PropTypes.bool,
        enablePublicLink: PropTypes.bool.isRequired,
        canDownloadFiles: PropTypes.bool.isRequired,
        isExternalFile: PropTypes.bool.isRequired,
        onGetPublicLink: PropTypes.func,
        scale: PropTypes.number,
        showZoomControls: PropTypes.bool,
        handleZoomIn: PropTypes.func,
        handleZoomOut: PropTypes.func,
        handleZoomReset: PropTypes.func,
    };

    static defaultProps = {
        fileIndex: 0,
        totalFiles: 0,
        filename: '',
        fileURL: '',
        showPublicLink: true,
    };

    render() {
        var publicLink = '';
        if (this.props.enablePublicLink && this.props.showPublicLink) {
            publicLink = (
                <span>
                    <a
                        href='#'
                        className='public-link text'
                        data-title='Public Image'
                        onClick={this.props.onGetPublicLink}
                    >
                        <FormattedMessage
                            id='view_image_popover.publicLink'
                            defaultMessage='Get a public link'
                        />
                    </a>
                    <span className='text'>{' | '}</span>
                </span>
            );
        }

        let downloadLinks = null;
        if (this.props.canDownloadFiles) {
            let downloadLinkText;
            const downloadLinkProps = {};
            if (this.props.isExternalFile) {
                downloadLinkText = (
                    <FormattedMessage
                        id='view_image_popover.open'
                        defaultMessage='Open'
                    />
                );
            } else {
                downloadLinkText = (
                    <FormattedMessage
                        id='view_image_popover.download'
                        defaultMessage='Download'
                    />
                );

                downloadLinkProps.download = this.props.filename;
            }

            downloadLinks = (
                <span className='modal-bar-links'>
                    {publicLink}
                    <a
                        href={this.props.fileURL}
                        className='text'
                        target='_blank'
                        rel='noopener noreferrer'
                        {...downloadLinkProps}
                    >
                        {downloadLinkText}
                    </a>
                </span>
            );
        }

        let zoomControls = [];
        if (this.props.showZoomControls) {
            let zoomResetButton;
            let zoomOutButton;
            let zoomInButton;

            if (this.props.scale > ZoomSettings.MIN_SCALE) {
                zoomOutButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={debounce(this.props.handleZoomOut, 300, {maxWait: 300})}>
                            <i className='icon icon-minus'/>
                        </a>
                    </span>
                );
            } else {
                zoomOutButton = (
                    <span className='btn-inactive'>
                        <i className='icon icon-minus'/>
                    </span>
                );
            }
            zoomControls.push(
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    key='zoomOut'
                    placement='top'
                    overlay={
                        <Tooltip id='zoom-out-icon-tooltip'>
                            <FormattedMessage
                                id='view_image.zoom_out'
                                defaultMessage='Zoom Out'
                            />
                        </Tooltip>
                    }
                >
                    {zoomOutButton}
                </OverlayTrigger>,
            );

            if (this.props.scale > ZoomSettings.DEFAULT_SCALE) {
                zoomResetButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={this.props.handleZoomReset}>
                            <i className='icon icon-magnify-minus'/>
                        </a>
                    </span>
                );
            } else if (this.props.scale < ZoomSettings.DEFAULT_SCALE) {
                zoomResetButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={this.props.handleZoomReset}>
                            <i className='icon icon-magnify-plus'/>
                        </a>
                    </span>
                );
            } else {
                zoomResetButton = (
                    <span className='btn-inactive'>
                        <i className='icon icon-magnify-minus'/>
                    </span>
                );
            }
            zoomControls.push(
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    key='zoomReset'
                    placement='top'
                    overlay={
                        <Tooltip id='zoom-reset-icon-tooltip'>
                            <FormattedMessage
                                id='view_image.zoom_reset'
                                defaultMessage='Reset Zoom'
                            />
                        </Tooltip>
                    }
                >
                    {zoomResetButton}
                </OverlayTrigger>,
            );

            if (this.props.scale < ZoomSettings.MAX_SCALE) {
                zoomInButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={debounce(this.props.handleZoomIn, 300, {maxWait: 300})}>
                            <i className='icon icon-plus'/>
                        </a>
                    </span>

                );
            } else {
                zoomInButton = (
                    <span className='btn-inactive'>
                        <i className='icon icon-plus'/>
                    </span>
                );
            }
            zoomControls.push(
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    key='zoomIn'
                    placement='top'
                    overlay={
                        <Tooltip id='zoom-in-icon-tooltip'>
                            <FormattedMessage
                                id='view_image.zoom_in'
                                defaultMessage='Zoom In'
                            />
                        </Tooltip>
                    }
                >
                    {zoomInButton}
                </OverlayTrigger>,
            );

            zoomControls = (
                <div className='modal-column'>
                    {zoomControls}
                </div>
            );
        }

        return (
            <div
                data-testid='fileCountFooter'
                ref='imageFooter'
                className='modal-button-bar'
            >
                <div className='modal-column text'>
                    <span className='modal-bar-file-count'>
                        <FormattedMessage
                            id='view_image_popover.file'
                            defaultMessage='File {count, number} of {total, number}'
                            values={{
                                count: (this.props.fileIndex + 1),
                                total: this.props.totalFiles,
                            }}
                        />
                    </span>
                </div>
                {zoomControls}
                <div className='modal-column text'>
                    {downloadLinks}
                </div>
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */
