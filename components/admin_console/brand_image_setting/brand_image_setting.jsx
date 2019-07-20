// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Client4} from 'mattermost-redux/client';

import {uploadBrandImage} from 'actions/admin_actions.jsx';
import {UploadStatuses, Constants} from 'utils/constants.jsx';
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
        onChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleImageSubmit = this.handleImageSubmit.bind(this);

        this.state = {
            brandImage: null,
            brandImageExists: false,
            brandImageTimestamp: Date.now(),
            error: '',
            status: UploadStatuses.DEFAULT,
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

        if (this.state.brandImage) {
            this.handleImageSubmit();
        }
    }

    handleImageChange() {
        const element = $(this.refs.fileInput);

        if (element.prop('files').length > 0) {
            this.setState({
                brandImage: element.prop('files')[0],
                status: UploadStatuses.DEFAULT,
            });
        }
    }

    handleImageSubmit() {
        if (!this.state.brandImage) {
            return;
        }

        if (this.state.status === UploadStatuses.LOADING) {
            return;
        }

        this.setState({
            error: '',
            status: UploadStatuses.LOADING,
        });
        this.props.onChange('deleteBrandImage', false);

        uploadBrandImage(
            this.state.brandImage,
            () => {
                this.setState({
                    brandImageExists: true,
                    brandImage: null,
                    brandImageTimestamp: Date.now(),
                    status: UploadStatuses.COMPLETE,
                });
            },
            (err) => {
                this.setState({
                    error: err.message,
                    status: UploadStatuses.DEFAULT,
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
        let displayImgOverlay = !this.props.disabled;
        const IMGOVERLAY = (
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
                    onClick={() => {
                        this.setState({brandImage: null, brandImageExists: false});
                        this.props.onChange('deleteBrandImage', true);
                    }}
                    style={{
                        backgroundColor: 'black',
                        color: 'white',
                        position: 'absolute',
                        top: '-8px',
                    }}
                >
                    <span aria-hidden={true}>{'×'}</span>
                </button>
            </OverlayTrigger>
        );
        if (this.state.brandImage) {
            img = (
                <img
                    ref='image'
                    className='brand-img'
                    alt='brand image'
                    src=''
                />
            );
        } else if (this.state.brandImageExists) {
            img = (
                <img
                    className='brand-img'
                    alt='brand image'
                    src={Client4.getBrandImageUrl(this.state.brandImageTimestamp)}
                />
            );
        } else {
            img = (
                <p>
                    <FormattedMessage
                        id='admin.team.noBrandImage'
                        defaultMessage='No brand image uploaded'
                    />
                </p>
            );
            displayImgOverlay = false;
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
                    {img}
                    {displayImgOverlay && IMGOVERLAY}
                </div>
                <div className='col-sm-4'/>
                <div className='col-sm-8'>
                    <div className='file__upload'>
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
