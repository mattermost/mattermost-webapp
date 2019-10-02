// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import BackstageHeader from 'components/backstage/components/backstage_header.jsx';
import FormError from 'components/form_error';
import SpinnerButton from 'components/spinner_button';
import {browserHistory} from 'utils/browser_history';
import {localizeMessage} from 'utils/utils.jsx';

export default class AddEmoji extends React.Component {
    static propTypes = {
        actions: PropTypes.shape({
            createCustomEmoji: PropTypes.func.isRequired,
        }).isRequired,
        emojiMap: PropTypes.object.isRequired,
        team: PropTypes.object,
        user: PropTypes.object,
    };

    static contextTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            name: '',
            image: null,
            imageUrl: '',
            saving: false,
            error: null,
        };
    }

    handleSubmit = async (e) => {
        const {actions, emojiMap, user, team} = this.props;
        const {image, name, saving} = this.state;

        e.preventDefault();

        if (saving) {
            return;
        }

        this.setState({
            saving: true,
            error: null,
        });

        const emoji = {
            creator_id: user.id,
            name: name.trim().toLowerCase(),
        };

        // trim surrounding colons if the user accidentally included them in the name
        if (emoji.name.startsWith(':') && emoji.name.endsWith(':')) {
            emoji.name = emoji.name.substring(1, emoji.name.length - 1);
        }

        if (!emoji.name) {
            this.setState({
                saving: false,
                error: (
                    <FormattedMessage
                        id='add_emoji.nameRequired'
                        defaultMessage='A name is required for the emoji'
                    />
                ),
            });

            return;
        } else if ((/[^a-z0-9_-]/).test(emoji.name)) {
            this.setState({
                saving: false,
                error: (
                    <FormattedMessage
                        id='add_emoji.nameInvalid'
                        defaultMessage="An emoji's name can only contain lowercase letters, numbers, and the symbols '-' and '_'."
                    />
                ),
            });

            return;
        } else if (emojiMap.hasSystemEmoji(emoji.name)) {
            this.setState({
                saving: false,
                error: (
                    <FormattedMessage
                        id='add_emoji.nameTaken'
                        defaultMessage='This name is already in use by a system emoji. Please choose another name.'
                    />
                ),
            });

            return;
        }

        if (!image) {
            this.setState({
                saving: false,
                error: (
                    <FormattedMessage
                        id='add_emoji.imageRequired'
                        defaultMessage='An image is required for the emoji'
                    />
                ),
            });

            return;
        }

        const {error} = await actions.createCustomEmoji(emoji, image);
        if (error) {
            this.setState({
                saving: false,
                error: error.message,
            });
            return;
        }

        browserHistory.push('/' + team.name + '/emoji');
    };

    updateName = (e) => {
        this.setState({
            name: e.target.value,
        });
    };

    updateImage = (e) => {
        if (e.target.files.length === 0) {
            this.setState({
                image: null,
                imageUrl: '',
            });

            return;
        }

        const image = e.target.files[0];

        const reader = new FileReader();
        reader.onload = () => {
            this.setState({
                image,
                imageUrl: reader.result,
            });
        };
        reader.readAsDataURL(image);
    };

    render() {
        let filename = null;
        if (this.state.image) {
            filename = (
                <span className='add-emoji__filename'>
                    {this.state.image.name}
                </span>
            );
        }

        let preview = null;
        if (this.state.imageUrl) {
            preview = (
                <div className='form-group'>
                    <label
                        className='control-label col-sm-4'
                        htmlFor='preview'
                    >
                        <FormattedMessage
                            id='add_emoji.preview'
                            defaultMessage='Preview'
                        />
                    </label>
                    <div className='col-md-5 col-sm-8 add-emoji__preview'>
                        <FormattedMessage
                            id='add_emoji.preview.sentence'
                            defaultMessage='This is a sentence with {image} in it.'
                            values={{
                                image: (
                                    <span
                                        className='emoticon'
                                        style={{backgroundImage: 'url(' + this.state.imageUrl + ')'}}
                                    />
                                ),
                            }}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className='backstage-content row'>
                <BackstageHeader>
                    <Link to={'/' + this.props.team.name + '/emoji'}>
                        <FormattedMessage
                            id='emoji_list.header'
                            defaultMessage='Custom Emoji'
                        />
                    </Link>
                    <FormattedMessage
                        id='add_emoji.header'
                        defaultMessage='Add'
                    />
                </BackstageHeader>
                <div className='backstage-form'>
                    <form
                        className='form-horizontal'
                        onSubmit={this.handleSubmit}
                    >
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='name'
                            >
                                <FormattedMessage
                                    id='add_emoji.name'
                                    defaultMessage='Name'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <input
                                    id='name'
                                    type='text'
                                    maxLength='64'
                                    className='form-control'
                                    value={this.state.name}
                                    onChange={this.updateName}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_emoji.name.help'
                                        defaultMessage="Choose a name for your emoji made of up to 64 characters consisting of lowercase letters, numbers, and the symbols '-' and '_'."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='image'
                            >
                                <FormattedMessage
                                    id='add_emoji.image'
                                    defaultMessage='Image'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <div>
                                    <div className='add-emoji__upload'>
                                        <button className='btn btn-primary'>
                                            <FormattedMessage
                                                id='add_emoji.image.button'
                                                defaultMessage='Select'
                                            />
                                        </button>
                                        <input
                                            id='select-emoji'
                                            type='file'
                                            accept='.jpg,.png,.gif'
                                            multiple={false}
                                            onChange={this.updateImage}
                                        />
                                    </div>
                                    {filename}
                                    <div className='form__help'>
                                        <FormattedMessage
                                            id='add_emoji.image.help'
                                            defaultMessage='Choose the image for your emoji. The image can be a gif, png, or jpeg file with a max size of 64 KB and dimensions up to 128 by 128 pixels.'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {preview}
                        <div className='backstage-form__footer'>
                            <FormError
                                type='backstage'
                                error={this.state.error}
                            />
                            <Link
                                className='btn btn-link btn-sm'
                                to={'/' + this.props.team.name + '/emoji'}
                            >
                                <FormattedMessage
                                    id='add_emoji.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Link>
                            <SpinnerButton
                                className='btn btn-primary'
                                type='submit'
                                spinning={this.state.saving}
                                spinningText={localizeMessage('add_emoji.saving', 'Saving...')}
                                onClick={this.handleSubmit}
                            >
                                <FormattedMessage
                                    id='add_emoji.save'
                                    defaultMessage='Save'
                                />
                            </SpinnerButton>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
