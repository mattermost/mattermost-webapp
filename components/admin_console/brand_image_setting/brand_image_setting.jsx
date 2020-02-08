// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';
import {Client4} from 'mattermost-redux/client';

import {uploadBrandImage, deleteBrandImage} from 'actions/admin_actions.jsx';
import {Constants} from 'utils/constants';
import FormError from 'components/form_error';
import OverlayTrigger from 'components/overlay_trigger';

const HTTP_STATUS_OK = 200;

export default class BrandImageSetting extends React.PureComponent {
    static propTypes = {

        /*
         * Set for testing purpose
         */
        id: PropTypes.string,

        /*
         * Set to disable the setting
         */
        disabled: PropTypes.bool.isRequired,

        /*
        * Set the save needed in the admin schema settings to trigger the save button to turn on
        */
        setSaveNeeded: PropTypes.func.isRequired,

        /*
        * Registers the function suppose to be run when the save button is pressed
        */
        registerSaveAction: PropTypes.func.isRequired,

        /*
        * Unregisters the function on unmount of the component suppose to be run when the save button is pressed
        */
        unRegisterSaveAction: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            deleteBrandImage: false,
            brandImage: null,
            brandImageExists: false,
            brandImageTimestamp: Date.now(),
            error: '',
        };
    }

    componentDidMount() {
        fetch(Client4.getBrandImageUrl(this.state.brandImageTimestamp)).then(
            (resp) => {
                if (resp.status === HTTP_STATUS_OK) {
                    this.setState({brandImageExists: true});
                } else {
                    this.setState({brandImageExists: false});
                }
            }
        );

        this.props.registerSaveAction(this.handleSave);
    }

    componentWillUnmount() {
        this.props.unRegisterSaveAction(this.handleSave);
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

    handleImageChange = () => {
        const element = $(this.refs.fileInput);
        if (element.prop('files').length > 0) {
            this.props.setSaveNeeded();
            this.setState({
                brandImage: element.prop('files')[0],
                deleteBrandImage: false,
            });
        }
    }

    handleDeleteButtonPressed = () => {
        this.setState({deleteBrandImage: true, brandImage: null, brandImageExists: false});
        this.props.setSaveNeeded();
    }

    handleSave = async () => {
        this.setState({
            error: '',
        });

        let error;
        if (this.state.deleteBrandImage) {
            await deleteBrandImage(
                () => {
                    this.setState({
                        deleteBrandImage: false,
                        brandImageExists: false,
                        brandImage: null,
                    });
                },
                (err) => {
                    error = err;
                    this.setState({
                        error: err.message,
                    });
                }
            );
        } else if (this.state.brandImage) {
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
                    error = err;
                    this.setState({
                        error: err.message,
                    });
                }
            );
        }
        return {error};
    }

    render() {
        let letbtnDefaultClass = 'btn';
        if (!this.props.disabled) {
            letbtnDefaultClass += ' btn-default';
        }

        let img = null;
        if (this.state.brandImage) {
            img = (
                <div className='remove-image__img mb-5'>
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
                <div className='remove-image__img mb-5'>
                    <img
                        alt='brand image'
                        src={Client4.getBrandImageUrl(this.state.brandImageTimestamp)}
                    />
                    {overlay}
                </div>
            );
        } else {
            img = (
                <p className='mt-2'>
                    <FormattedMessage
                        id='admin.team.noBrandImage'
                        defaultMessage='No brand image uploaded'
                    />
                </p>
            );
        }

        return (
            <div
                data-testid={this.props.id}
                className='form-group'
            >
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
                    <div className='file__upload mt-5'>
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
                    <p className='help-text m-0'>
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
