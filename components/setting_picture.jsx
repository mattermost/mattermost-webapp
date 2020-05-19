// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import * as FileUtils from 'utils/file_utils.jsx';

import FormError from 'components/form_error';
import OverlayTrigger from 'components/overlay_trigger';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

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
        helpText: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.settingList = React.createRef();
        this.selectInput = React.createRef();
        this.confirmButton = React.createRef();

        this.state = {
            image: null,
            removeSrc: false,
            setDefaultSrc: false,
        };
    }

    focusFirstElement() {
        if (this.settingList.current) {
            this.settingList.current.focus();
        }
    }

    componentDidMount() {
        this.focusFirstElement();

        if (this.selectInput.current) {
            this.selectInput.current.addEventListener('input', this.handleFileSelected);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.file !== this.props.file) {
            this.setPicture(this.props.file);
        }
    }

    componentWillUnmount() {
        if (this.previewBlob) {
            URL.revokeObjectURL(this.previewBlob);
        }

        if (this.selectInput.current) {
            this.selectInput.current.removeEventListener('input', this.handleFileSelected);
        }
    }

    handleCancel = (e) => {
        this.setState({removeSrc: false, setDefaultSrc: false});
        this.props.updateSection(e);
    }

    handleFileSelected = () => {
        if (this.confirmButton.current) {
            this.confirmButton.current.focus();
        }
    }

    handleSave = (e) => {
        e.preventDefault();
        if (this.props.loadingPicture) {
            return;
        }
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
        this.focusFirstElement();
    }

    handleSetDefaultSrc = (e) => {
        e.preventDefault();
        this.setState({setDefaultSrc: true});
        this.focusFirstElement();
    }

    handleFileChange = (e) => {
        this.setState({removeSrc: false, setDefaultSrc: false});
        this.props.onFileChange(e);
    }

    handleInputFile = () => {
        this.selectInput.current.value = '';
        this.selectInput.current.click();
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
                        defaultMessage='Remove This Icon'
                    />
                );
                handler = this.handleRemoveSrc;
            } else if (this.props.onSetDefault) {
                title = (
                    <FormattedMessage
                        id='setting_picture.remove_profile_picture'
                        defaultMessage='Remove Profile Picture'
                    />
                );
                handler = this.handleSetDefaultSrc;
            }

            return (
                <div className={`${imageContext}-img__container`}>
                    <div
                        className='img-preview__image'
                        aria-hidden={true}
                    >
                        {imageElement}
                    </div>
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='right'
                        overlay={(
                            <Tooltip id='removeIcon'>
                                <div aria-hidden={true}>
                                    {title}
                                </div>
                            </Tooltip>
                        )}
                    >
                        <button
                            data-testid='removeSettingPicture'
                            className={`${imageContext}-img__remove`}
                            onClick={handler}
                        >
                            <span aria-hidden={true}>{'×'}</span>
                            <span className='sr-only'>{title}</span>
                        </button>
                    </OverlayTrigger>
                </div>
            );
        }
        return null;
    }

    render() {
        const img = this.renderImg();

        let confirmButtonClass = 'btn btn-sm';
        let disableSaveButtonFocus = false;
        if (this.props.submitActive || this.state.removeSrc || this.state.setDefaultSrc) {
            confirmButtonClass += ' btn-primary';
        } else {
            confirmButtonClass += ' btn-inactive disabled';
            disableSaveButtonFocus = true;
        }

        let imgRender;
        if (img) {
            imgRender = (
                <li
                    className='setting-list-item'
                    role='presentation'
                >
                    {img}
                </li>
            );
        }

        let buttonRender;
        if (this.props.onSubmit) {
            buttonRender = (
                <span>
                    <input
                        data-testid='uploadPicture'
                        ref={this.selectInput}
                        className='hidden'
                        accept='.jpg,.png,.bmp'
                        type='file'
                        onChange={this.handleFileChange}
                        disabled={this.props.loadingPicture}
                        aria-hidden={true}
                        tabIndex='-1'
                    />
                    <button
                        data-testid='inputSettingPictureButton'
                        className='btn btn-sm btn-primary btn-file sel-btn'
                        disabled={this.props.loadingPicture}
                        onClick={this.handleInputFile}
                        aria-label={localizeMessage('setting_picture.select', 'Select')}
                    >
                        <FormattedMessage
                            id='setting_picture.select'
                            defaultMessage='Select'
                        />
                    </button>
                    <button
                        tabIndex={disableSaveButtonFocus ? '-1' : '0'}
                        data-testid='saveSettingPicture'
                        disabled={disableSaveButtonFocus}
                        ref={this.confirmButton}
                        className={confirmButtonClass}
                        onClick={this.handleSave}
                        aria-label={this.props.loadingPicture ? localizeMessage('setting_picture.uploading', 'Uploading...') : localizeMessage('setting_picture.save', 'Save')}
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
                    </button>
                </span>
            );
        }
        return (
            <section className='section-max form-horizontal'>
                <h4 className='col-xs-12 section-title'>
                    {this.props.title}
                </h4>
                <div className='col-xs-offset-3 col-xs-8'>
                    <div
                        className='setting-list'
                        ref={this.settingList}
                        tabIndex='-1'
                        aria-label={this.props.title}
                        aria-describedby='setting-picture__helptext'
                    >
                        {imgRender}
                        <div
                            id='setting-picture__helptext'
                            className='setting-list-item pt-3'
                        >
                            {this.props.helpText}
                        </div>
                        <div
                            className='setting-list-item'
                        >
                            <hr/>
                            <FormError
                                errors={[this.props.clientError, this.props.serverError]}
                                type={'modal'}
                            />
                            {buttonRender}
                            <button
                                data-testid='cancelSettingPicture'
                                className='btn btn-link btn-sm theme'
                                href='#'
                                onClick={this.handleCancel}
                                aria-label={localizeMessage('setting_picture.cancel', 'Cancel')}
                            >
                                <FormattedMessage
                                    id='setting_picture.cancel'
                                    defaultMessage='Cancel'
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
