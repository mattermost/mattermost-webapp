// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ZoomSettings} from 'utils/constants';

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
                <div className='image-links'>
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
                </div>
            );
        }

        let zoomInButton;
        if (this.props.showZoomControls) {
            if (this.props.scale < ZoomSettings.MAX_SCALE) {
                zoomInButton = (
                    <a onClick={debounce(this.props.handleZoomIn, 300, {maxWait: 300})}>
                        <span className='modal-zoom-btn'>
                            {<i className='icon icon-plus'/>}
                        </span>
                    </a>
                );
            } else {
                zoomInButton = (
                    <span className='btn-inactive'>
                        {<i className='icon icon-plus'/>}
                    </span>
                );
            }
        }

        let zoomOutButton;
        if (this.props.showZoomControls) {
            if (this.props.scale > ZoomSettings.MIN_SCALE) {
                zoomOutButton = (
                    <a onClick={debounce(this.props.handleZoomOut, 300, {maxWait: 300})}>
                        <span className='modal-zoom-btn'>
                            {<i className='icon icon-minus'/>}
                        </span>
                    </a>
                );
            } else {
                zoomOutButton = (
                    <span className='btn-inactive'>
                        {<i className='icon icon-minus'/>}
                    </span>
                );
            }
        }

        let zoomResetButton;
        if (this.props.showZoomControls) {
            if (this.props.scale > ZoomSettings.DEFAULT_SCALE) {
                zoomResetButton = (
                    <a onClick={this.props.handleZoomReset}>
                        <span className='modal-zoom-btn'>
                            {<i className='icon icon-magnify-minus'/>}
                        </span>
                    </a>
                );
            } else if (this.props.scale < ZoomSettings.DEFAULT_SCALE) {
                zoomResetButton = (
                    <a onClick={this.props.handleZoomReset}>
                        <span className='modal-zoom-btn'>
                            {<i className='icon icon-magnify-plus'/>}
                        </span>
                    </a>
                );
            } else {
                zoomResetButton = (
                    <span className='btn-inactive'>
                        {<i className='icon icon-magnify-minus'/>}
                    </span>
                );
            }
        }

        return (
            <div
                data-testid='fileCountFooter'
                ref='imageFooter'
                className='modal-button-bar'
            >
                <span className='pull-left text'>
                    <FormattedMessage
                        id='view_image_popover.file'
                        defaultMessage='File {count, number} of {total, number}'
                        values={{
                            count: (this.props.fileIndex + 1),
                            total: this.props.totalFiles,
                        }}
                    />
                </span>
                <span className='modal-zoom-controls'>
                    {zoomOutButton}
                    {zoomResetButton}
                    {zoomInButton}
                </span>
                <span className='pull-right text'>
                    {downloadLinks}
                </span>
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */
