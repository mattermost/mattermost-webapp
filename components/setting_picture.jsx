// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {Constants} from 'utils/constants.jsx';
import {fileSizeToString, localizeMessage} from 'utils/utils.jsx';
import * as FileUtils from 'utils/file_utils.jsx';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';
import FormError from 'components/form_error.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class SettingPicture extends Component {
    static defaultProps = {
        imageContext: 'profile',
    };

    static propTypes = {
        clientError: PropTypes.string,
        serverError: PropTypes.string,
        src: PropTypes.string,
        defaultImageSrc: PropTypes.string,
        file: PropTypes.object,
        loadingPicture: PropTypes.bool,
        submitActive: PropTypes.bool,
        onRemove: PropTypes.func,
        onSetDefault: PropTypes.func,
        onSubmit: PropTypes.func,
        title: PropTypes.string,
        onFileChange: PropTypes.func,
        updateSection: PropTypes.func,
        imageContext: PropTypes.string,
        maxFileSize: PropTypes.number,
    };

    constructor(props) {
        super(props);

        this.state = {
            image: null,
            removeSrc: false,
            setDefaultSrc: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.file !== this.props.file) {
            this.setState({image: null});

            this.setPicture(nextProps.file);
        }
    }

    componentWillUnmount() {
        if (this.previewBlob) {
            URL.revokeObjectURL(this.previewBlob);
        }
    }

    handleCancel = (e) => {
        this.setState({removeSrc: false, setDefaultSrc: false});
        this.props.updateSection(e);
    }

    handleSave = (e) => {
        e.preventDefault();
        if (this.state.removeSrc) {
            this.props.onRemove();
        } else if (this.state.setDefaultSrc) {
            this.props.onSetDefault();
        } else {
            this.props.onSubmit();
        }
    }

    handleRemoveSrc = (e) => {
        e.preventDefault();
        this.setState({removeSrc: true});
    }

    handleSetDefaultSrc = (e) => {
        e.preventDefault();
        this.setState({setDefaultSrc: true});
    }

    handleFileChange = (e) => {
        this.setState({removeSrc: false, setDefaultSrc: false});
        this.props.onFileChange(e);
    }

    setPicture = (file) => {
        if (file) {
            this.previewBlob = URL.createObjectURL(file);

            var reader = new FileReader();
            reader.onload = (e) => {
                const orientation = FileUtils.getExifOrientation(e.target.result);
                const orientationStyles = FileUtils.getOrientationStyles(orientation);

                this.setState({
                    image: this.previewBlob,
                    orientationStyles,
                });
            };
            reader.readAsArrayBuffer(file);
        }
    }

    renderImg = () => {
        const imageContext = this.props.imageContext;

        if (this.props.file) {
            const imageStyles = {
                backgroundImage: 'url(' + this.state.image + ')',
                ...this.state.orientationStyles,
            };

            return (
                <div className={`${imageContext}-img-preview`}>
                    <div className='img-preview__image'>
                        <div
                            alt={`${imageContext} image preview`}
                            style={imageStyles}
                            className={`${imageContext}-img-preview`}
                        />
                    </div>
                </div>
            );
        }

        if (this.state.setDefaultSrc) {
            return (
                <img
                    className={`${imageContext}-img`}
                    alt={`${imageContext} image`}
                    src={this.props.defaultImageSrc}
                />
            );
        }

        if (this.props.src && !this.state.removeSrc) {
            const imageElement = (
                <img
                    className={`${imageContext}-img`}
                    alt={`${imageContext} image`}
                    src={this.props.src}
                />
            );
            if (!this.props.onRemove && !this.props.onSetDefault) {
                return imageElement;
            }

            let title;
            let handler;
            if (this.props.onRemove) {
                title = (
                    <FormattedMessage
                        id='setting_picture.remove'
                        defaultMessage='Remove this icon'
                    />
                );
                handler = this.handleRemoveSrc;
            } else if (this.props.onSetDefault) {
                title = (
                    <FormattedMessage
                        id='setting_picture.remove_profile_picture'
                        defaultMessage='Remove profile picture'
                    />
                );
                handler = this.handleSetDefaultSrc;
            }

            return (
                <div className={`${imageContext}-img__container`}>
                    <div className='img-preview__image'>
                        {imageElement}
                    </div>
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='right'
                        overlay={(
                            <Tooltip id='removeIcon'>
                                {title}
                            </Tooltip>
                        )}
                    >
                        <a
                            className={`${imageContext}-img__remove`}
                            onClick={handler}
                        >
                            <span>{'×'}</span>
                        </a>
                    </OverlayTrigger>
                </div>
            );
        }
        return null;
    }

    render() {
        const imageContext = this.props.imageContext;

        const img = this.renderImg();

        let confirmButtonClass = 'btn btn-sm';
        if (this.props.submitActive || this.state.removeSrc || this.state.setDefaultSrc) {
            confirmButtonClass += ' btn-primary';
        } else {
            confirmButtonClass += ' btn-inactive disabled';
        }

        let helpText;
        if (imageContext === 'team') {
            helpText = (
                <FormattedMarkdownMessage
                    id={'setting_picture.help.team'}
                    defaultMessage='Upload a team icon in BMP, JPG or PNG format.\nSquare images with a solid background color are recommended.'
                />
            );
        } else {
            helpText = (
                <FormattedMessage
                    id={'setting_picture.help.profile'}
                    defaultMessage='Upload a picture in BMP, JPG or PNG format. Maximum file size: {max}'
                    values={{max: fileSizeToString(this.props.maxFileSize)}}
                />
            );
        }

        return (
            <ul className='section-max form-horizontal'>
                <li className='col-xs-12 section-title'>{this.props.title}</li>
                <li className='col-xs-offset-3 col-xs-8'>
                    <ul className='setting-list'>
                        {img ? <li className='setting-list-item'> {img} </li> : ''}
                        <li className='setting-list-item padding-top x2'>
                            {helpText}
                        </li>
                        <li className='setting-list-item'>
                            <hr/>
                            <FormError
                                errors={[this.props.clientError, this.props.serverError]}
                                type={'modal'}
                            />
                            <div
                                className='btn btn-sm btn-primary btn-file sel-btn'
                                disabled={this.props.loadingPicture}
                            >
                                <FormattedMessage
                                    id='setting_picture.select'
                                    defaultMessage='Select'
                                />
                                <input
                                    ref='input'
                                    accept='.jpg,.png,.bmp'
                                    type='file'
                                    onChange={this.handleFileChange}
                                    disabled={this.props.loadingPicture}
                                />
                            </div>
                            <a
                                className={confirmButtonClass}
                                onClick={this.props.loadingPicture ? () => true : this.handleSave}
                            >
                                <LoadingWrapper
                                    loading={this.props.loadingPicture}
                                    text={localizeMessage('setting_picture.uploading', 'Uploading...')}
                                >
                                    <FormattedMessage
                                        id='setting_picture.save'
                                        defaultMessage='Save'
                                    />
                                </LoadingWrapper>
                            </a>
                            <a
                                className='btn btn-link btn-sm theme'
                                href='#'
                                onClick={this.handleCancel}
                            >
                                <FormattedMessage
                                    id='setting_picture.cancel'
                                    defaultMessage='Cancel'
                                />
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        );
    }
}
