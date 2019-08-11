// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Client4} from 'mattermost-redux/client';

import {uploadBrandImage, deleteBrandImage} from 'actions/admin_actions.jsx';
import {Constants} from 'utils/constants.jsx';
import FormError from 'components/form_error.jsx';

const HTTP_STATUS_OK = 200;

export default class BrandImageSetting extends React.PureComponent {
    static propTypes = {

        /*
         * Set to disable the setting
         */
        disabled: PropTypes.bool.isRequired,

        /*
        * Enable save button when image is deleted
        */
        setSaveNeeded: PropTypes.func.isRequired,

        /*
        * Is the component saving or not
        */
        saving: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleDeleteButtonPressed = this.handleDeleteButtonPressed.bind(this);

        this.state = {
            deleteBrandImage: false,
            brandImage: null,
            brandImageExists: false,
            brandImageTimestamp: Date.now(),
            error: '',
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        fetch(Client4.getBrandImageUrl(this.state.brandImageTimestamp)).then(
            (resp) => {
                if (resp.status === HTTP_STATUS_OK) {
                    this.setState({brandImageExists: true});
                } else {
                    this.setState({brandImageExists: false});
                }
            }
        );
    }

    componentDidUpdate() {
        if (this.refs.image) {
            const reader = new FileReader();

            const img = this.refs.image;
            reader.onload = (e) => {
                $(img).attr('src', e.target.result);
            };

            reader.readAsDataURL(this.state.brandImage);
        }
    }

    handleImageChange() {
        const element = $(this.refs.fileInput);
        if (element.prop('files').length > 0) {
            this.props.setSaveNeeded();
            this.setState({
                brandImage: element.prop('files')[0],
            });
        }
    }

    handleDeleteButtonPressed() {
        this.setState({deleteBrandImage: true, brandImage: null, brandImageExists: false});
        this.props.setSaveNeeded();
    }

    // This function is used from the outside to trigger the delete of the image when needed.
    async handleImageDelete() {
        this.setState({
            error: '',
        });

        await deleteBrandImage(
            () => {
                this.setState({
                    deleteBrandImage: false,
                    brandImageExists: false,
                    brandImage: null,
                });
            },
            (err) => {
                this.setState({
                    error: err.message,
                });
            }
        );
    }

    // This function is used from the outside to trigger the save of the image when needed.
    async handleImageSave() {
        this.setState({
            error: '',
        });

        await uploadBrandImage(
            this.state.brandImage,
            () => {
                this.setState({
                    brandImageExists: true,
                    brandImage: null,
                    brandImageTimestamp: Date.now(),
                });
            },
            (err) => {
                this.setState({
                    error: err.message,
                });
            }
        );
    }

    render() {
        let letbtnDefaultClass = 'btn';
        if (!this.props.disabled) {
            letbtnDefaultClass += ' btn-default';
        }

        let img = null;
        if (this.state.brandImage) {
            img = (
                <div className='remove-image__img margin-bottom x3'>
                    <img
                        ref='image'
                        alt='brand image'
                        src=''
                    />
                </div>
            );
        } else if (this.state.brandImageExists) {
            let overlay;
            if (!this.props.disabled) {
                overlay = (
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='right'
                        overlay={(
                            <Tooltip id='removeIcon'>
                                <div aria-hidden={true}>
                                    <FormattedMessage
                                        id='admin.team.removeBrandImage'
                                        defaultMessage='Remove brand image'
                                    />
                                </div>
                            </Tooltip>
                        )}
                    >
                        <button
                            className='remove-image__btn'
                            onClick={this.handleDeleteButtonPressed}
                        >
                            <span aria-hidden={true}>{'×'}</span>
                        </button>
                    </OverlayTrigger>
                );
            }
            img = (
                <div className='remove-image__img margin-bottom x3'>
                    <img
                        alt='brand image'
                        src={Client4.getBrandImageUrl(this.state.brandImageTimestamp)}
                    />
                    {overlay}
                </div>
            );
        } else {
            img = (
                <p className='margin-top'>
                    <FormattedMessage
                        id='admin.team.noBrandImage'
                        defaultMessage='No brand image uploaded'
                    />
                </p>
            );
        }

        return (
            <div className='form-group'>
                <label className='control-label col-sm-4'>
                    <FormattedMessage
                        id='admin.team.brandImageTitle'
                        defaultMessage='Custom Brand Image:'
                    />
                </label>
                <div className='col-sm-8'>
                    <div className='remove-image'>
                        {img}
                    </div>
                </div>
                <div className='col-sm-4'/>
                <div className='col-sm-8'>
                    <div className='file__upload margin-top x3'>
                        <button
                            className={letbtnDefaultClass}
                            disabled={this.props.disabled}
                        >
                            <FormattedMessage
                                id='admin.team.chooseImage'
                                defaultMessage='Select Image'
                            />
                        </button>
                        <input
                            ref='fileInput'
                            type='file'
                            accept='.jpg,.png,.bmp'
                            disabled={this.props.disabled}
                            onChange={this.handleImageChange}
                        />
                    </div>
                    <br/>
                    <FormError error={this.state.error}/>
                    <p className='help-text no-margin'>
                        <FormattedHTMLMessage
                            id='admin.team.uploadDesc'
                            defaultMessage='Customize your user experience by adding a custom image to your login screen. See examples at <a href="http://docs.mattermost.com/administration/config-settings.html#custom-branding" target="_blank">docs.mattermost.com/administration/config-settings.html#custom-branding</a>.'
                        />
                    </p>
                </div>
            </div>
        );
    }
}
