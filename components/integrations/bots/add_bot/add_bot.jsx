// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import exif2css from 'exif2css';

import BotDefaultIcon from 'images/bot_default_icon.png';

import {browserHistory} from 'utils/browser_history';
import BackstageHeader from 'components/backstage/components/backstage_header.jsx';
import SpinnerButton from 'components/spinner_button.jsx';
import FormError from 'components/form_error.jsx';
import {AcceptedProfileImageTypes, OVERLAY_TIME_DELAY} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default class AddBot extends React.Component {
    static propTypes = {

        /**
        *  Only used for routing since backstage is team based.
        */
        team: PropTypes.object.isRequired,

        /**
        *  Bot to edit (if editing)
        */
        bot: PropTypes.object,

        /**
        * Maximum upload file size (for bot accoutn profile picture)
        */
        maxFileSize: PropTypes.number.isRequired,

        /**
        * Bot to edit
        */
        actions: PropTypes.shape({

            /**
            * Creates a new bot account.
            */
            createBot: PropTypes.func.isRequired,

            /**
            * Creates a new bot account.
            */
            patchBot: PropTypes.func.isRequired,

            /**
            * Uploads a user profile image
            */
            uploadProfileImage: PropTypes.func.isRequired,

            /**
            * Set profile image to default
            */
            setDefaultProfileImage: PropTypes.func.isRequired,
        }),
    }

    constructor(props) {
        super(props);

        this.state = {
            error: '',
            username: '',
            displayName: '',
            description: '',
            adding: false,
            image: BotDefaultIcon,
        };

        if (this.props.bot) {
            this.state.username = this.props.bot.username;
            this.state.displayName = this.props.bot.display_name;
            this.state.description = this.props.bot.description;
        }
    }

    updateUsername = (e) => {
        this.setState({
            username: e.target.value,
        });
    }

    updateDisplayName = (e) => {
        this.setState({
            displayName: e.target.value,
        });
    }

    updateDescription = (e) => {
        this.setState({
            description: e.target.value,
        });
    }

    updatePicture = (e) => {
        if (e.target.files && e.target.files[0]) {
            const pictureFile = e.target.files[0];
            this.previewBlob = URL.createObjectURL(pictureFile);

            var reader = new FileReader();
            reader.onload = (e2) => {
                const orientation = this.getExifOrientation(e2.target.result);
                const orientationStyles = this.getOrientationStyles(orientation);

                this.setState({
                    image: this.previewBlob,
                    orientationStyles,
                });
            };
            reader.readAsArrayBuffer(pictureFile);
            e.target.value = null;
            this.setState({pictureFile});
        } else {
            this.setState({pictureFile: null, image: null});
        }
    }

    setDefault = () => {
        this.setState({pictureFile: 'default', image: BotDefaultIcon});
    }

    // based on https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
    getExifOrientation(data) {
        var view = new DataView(data);

        if (view.getUint16(0, false) !== 0xFFD8) {
            return -2;
        }

        var length = view.byteLength;
        var offset = 2;

        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;

            if (marker === 0xFFE1) {
                if (view.getUint32(offset += 2, false) !== 0x45786966) {
                    return -1;
                }

                var little = view.getUint16(offset += 6, false) === 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;

                for (var i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                        return view.getUint16(offset + (i * 12) + 8, little);
                    }
                }
            } else if ((marker & 0xFF00) === 0xFF00) {
                offset += view.getUint16(offset, false);
            } else {
                break;
            }
        }
        return -1;
    }

    getOrientationStyles(orientation) {
        const {
            transform,
            'transform-origin': transformOrigin,
        } = exif2css(orientation);
        return {transform, transformOrigin};
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        if (this.state.adding) {
            return;
        }

        if (!this.state.username) {
            this.setState({
                error: (
                    <FormattedMessage
                        id='bots.manage.add.invalid_username'
                        defaultMessage='Usernames have to begin with a lowercase letter and be 3-22 characters long. You can use lowercase letters, numbers, periods, dashes, and underscores.'
                    />
                ),
            });
            return;
        }

        if (this.state.pictureFile) {
            if (!AcceptedProfileImageTypes.includes(this.state.pictureFile.type)) {
                this.setState({
                    error: (
                        <FormattedMessage
                            id='user.settings.general.validImage'
                            defaultMessage='Only BMP, JPG or PNG images may be used for profile pictures'
                        />
                    ),
                });
            } else if (this.state.pictureFile.size > this.props.maxFileSize) {
                this.setState({
                    error: (
                        <FormattedMessage
                            id='user.settings.general.imageTooLarge'
                            defaultMessage='Unable to upload profile image. File is too large.'
                        />
                    ),
                });
            }
        }

        this.setState({
            adding: true,
            error: '',
        });

        const bot = {
            username: this.state.username,
            display_name: this.state.displayName,
            description: this.state.description,
        };

        let data;
        let error;
        if (this.props.bot) {
            const result = await this.props.actions.patchBot(this.props.bot.user_id, bot);
            data = result.data;
            error = result.error;

            if (!error) {
                if (this.state.pictureFile && this.state.pictureFile !== 'default') {
                    const imageResult = await this.props.actions.uploadProfileImage(data.user_id, this.state.pictureFile);
                    error = imageResult.error;
                } else {
                    await this.props.actions.setDefaultProfileImage(data.user_id);
                }
            }

            if (data) {
                browserHistory.push(`/${this.props.team.name}/integrations/bots`);
                return;
            }
        } else {
            const result = await this.props.actions.createBot(bot);
            data = result.data;
            error = result.error;

            if (!error) {
                if (this.state.pictureFile && this.state.pictureFile !== 'default') {
                    const imageResult = await this.props.actions.uploadProfileImage(data.user_id, this.state.pictureFile);
                    error = imageResult.error;
                } else {
                    await this.props.actions.setDefaultProfileImage(data.user_id);
                }
            }
            if (data) {
                browserHistory.push(`/${this.props.team.name}/integrations/confirm?type=bots&id=${data.user_id}`);
                return;
            }
        }

        this.setState({
            adding: false,
        });

        if (error) {
            this.setState({
                error: error.message,
            });
        }
    }

    render() {
        let subtitle = (
            <FormattedMessage
                id='bots.manage.add'
                defaultMessage='Add'
            />
        );
        let buttonText = (
            <FormattedMessage
                id='bots.manage.add.create'
                defaultMessage='Create Bot Account'
            />
        );
        let buttonActiveText = (
            <FormattedMessage
                id='bots.manage.add.creating'
                defaultMessage='Creating...'
            />
        );

        // If we are editing
        if (this.props.bot) {
            subtitle = (
                <FormattedMessage
                    id='bots.manage.edit'
                    defaultMessage='Edit'
                />
            );
            buttonText = (
                <FormattedMessage
                    id='bots.manage.edit.title'
                    defaultMessage='Update'
                />
            );
            buttonActiveText = (
                <FormattedMessage
                    id='bots.manage.edit.editing'
                    defaultMessage='Updating...'
                />
            );
        }

        let imageURL = '';
        let removeImageIcon = (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                delayShow={OVERLAY_TIME_DELAY}
                placement='right'
                overlay={(
                    <Tooltip id='removeIcon'>
                        <FormattedMessage
                            id='bot.remove_profile_picture'
                            defaultMessage='Remove Bot Icon'
                        />
                    </Tooltip>
                )}
            >
                <a
                    className={'bot-profile__remove'}
                    onClick={this.setDefault}
                >
                    <span>{'×'}</span>
                </a>
            </OverlayTrigger>
        );
        let imageStyles = null;
        if (this.props.bot && !this.state.pictureFile) {
            imageURL = Utils.imageURLForUser(this.props.bot.user_id);
        } else {
            imageURL = this.state.image;
            imageStyles = this.state.orientationStyles;
            if (this.state.image === BotDefaultIcon) {
                removeImageIcon = null;
            }
        }

        return (
            <div className='backstage-content'>
                <BackstageHeader>
                    <Link to={`/${this.props.team.name}/integrations/bots`}>
                        <FormattedMessage
                            id='bots.manage.header'
                            defaultMessage='Bot Accounts'
                        />
                    </Link>
                    {subtitle}
                </BackstageHeader>
                <div className='backstage-form'>
                    <form
                        className='form-horizontal'
                        onSubmit={this.handleSubmit}
                    >
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='username'
                            >
                                <FormattedMessage
                                    id='bots.add.username'
                                    defaultMessage='Username'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <input
                                    id='username'
                                    type='text'
                                    maxLength='64'
                                    className='form-control'
                                    value={this.state.username}
                                    onChange={this.updateUsername}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='bot.add.username.help'
                                        defaultMessage='You can use lowercase letters, numbers, periods, dahses, and underscores.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='boticon'
                            >
                                <FormattedMessage
                                    id='bots.add.icon'
                                    defaultMessage='Bot Icon'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <div className={'bot-img-container'}>
                                    <img
                                        className={'bot-img'}
                                        alt={'bot image'}
                                        src={imageURL}
                                        style={imageStyles}
                                    />
                                    {removeImageIcon}
                                </div>
                                <div
                                    className='btn btn-sm btn-primary btn-file sel-btn'
                                >
                                    <FormattedMessage
                                        id='setting_picture.select'
                                        defaultMessage='Select'
                                    />
                                    <input
                                        accept='.jpg,.png,.bmp'
                                        type='file'
                                        onChange={this.updatePicture}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='displayName'
                            >
                                <FormattedMessage
                                    id='bots.add.displayName'
                                    defaultMessage='Display Name'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <input
                                    id='displayName'
                                    type='text'
                                    maxLength='64'
                                    className='form-control'
                                    value={this.state.displayName}
                                    onChange={this.updateDisplayName}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='bot.add.display_name.help'
                                        defaultMessage={'(Optional) You can choose to display your bot\'s full name rather than its username.'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='description'
                            >
                                <FormattedMessage
                                    id='bot.add.description'
                                    defaultMessage='Description'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <input
                                    id='description'
                                    type='text'
                                    maxLength='1024'
                                    className='form-control'
                                    value={this.state.description}
                                    onChange={this.updateDescription}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='bot.add.description.help'
                                        defaultMessage='(Optional) Let others know what this bot does.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='backstage-form__footer'>
                            <FormError
                                type='backstage'
                                errors={[this.state.error]}
                            />
                            <Link
                                className='btn btn-link btn-sm'
                                to={`/${this.props.team.name}/integrations/bots`}
                            >
                                <FormattedMessage
                                    id='bots.manage.add.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Link>
                            <SpinnerButton
                                className='btn btn-primary'
                                type='submit'
                                spinning={this.state.adding}
                                spinningText={buttonActiveText}
                                onClick={this.handleSubmit}
                            >
                                {buttonText}
                            </SpinnerButton>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
