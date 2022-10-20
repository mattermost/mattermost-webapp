// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {localizeMessage} from 'utils/utils';
import {OutgoingWebhook} from '@mattermost/types/integrations';
import BackstageHeader from 'components/backstage/components/backstage_header';
import ChannelSelect from 'components/channel_select';
import FormError from 'components/form_error';
import SpinnerButton from 'components/spinner_button';

type Props = {
    team: {id: string ; name: string};
    header: {id: string ; defaultMessage: string};
    footer: {id: string ; defaultMessage: string};
    loading: {id: string ; defaultMessage: string};
    renderExtra: JSX.Element | string;
    serverError: string;
    initialHook: Partial<OutgoingWebhook>;
    action: (hook: OutgoingWebhook) => Promise<void>;
    enablePostUsernameOverride: boolean;
    enablePostIconOverride: boolean;
}

type State= Partial<OutgoingWebhook> & {
    saving: boolean;
    clientError: null | JSX.Element | string;
}

export default class AbstractOutgoingWebhook extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this.getStateFromHook(this.props.initialHook || {});
    }

    getStateFromHook = (hook: Props['initialHook']) => {
        let triggerWords = '';
        if (hook.trigger_words) {
            let i = 0;
            for (i = 0; i < hook.trigger_words.length; i++) {
                triggerWords += hook.trigger_words[i] + '\n';
            }
        }

        let callbackUrls = '';
        if (hook.callback_urls) {
            let i = 0;
            for (i = 0; i < hook.callback_urls.length; i++) {
                callbackUrls += hook.callback_urls[i] + '\n';
            }
        }

        return {
            displayName: hook.display_name || '',
            description: hook.description || '',
            contentType: hook.content_type || 'application/x-www-form-urlencoded',
            channelId: hook.channel_id || '',
            triggerWords,
            triggerWhen: hook.trigger_when || 0,
            callbackUrls,
            saving: false,
            clientError: null,
            username: hook.username || '',
            iconURL: hook.icon_url || '',
        };
    }

    handleSubmit = (e: {preventDefault: () => void}) => {
        e.preventDefault();

        if (this.state.saving) {
            return;
        }

        this.setState({
            saving: true,
            clientError: '',
        });

        const triggerWords = [];
        if (this.state.trigger_words) {
            for (let triggerWord of this.state.trigger_words.split('\n')) {
                triggerWord = triggerWord.trim();

                if (triggerWord.length > 0) {
                    triggerWords.push(triggerWord);
                }
            }
        }

        if (!this.state.channel_id && triggerWords.length === 0) {
            this.setState({
                saving: false,
                clientError: (
                    <FormattedMessage
                        id='add_outgoing_webhook.triggerWordsOrChannelRequired'
                        defaultMessage='A valid channel or a list of trigger words is required'
                    />
                ),
            });

            return;
        }

        const callbackUrls: string[] = [];
        if (this.state.callback_urls !== undefined) {
            for (let callbackUrl of this.state.callback_urls.split('\n')) {
                callbackUrl = callbackUrl.trim();

                if (callbackUrl.length > 0) {
                    callbackUrls.push(callbackUrl);
                }
            }

            if (callbackUrls.length === 0) {
                this.setState({
                    saving: false,
                    clientError: (
                        <FormattedMessage
                            id='add_outgoing_webhook.callbackUrlsRequired'
                            defaultMessage='One or more callback URLs are required'
                        />
                    ),
                });

                return;
            }
        }
        const hook = {
            team_id: this.props.team.id,
            channel_id: this.state.channel_id,
            trigger_words: this.state.trigger_words,
            trigger_when: (this.state.trigger_when, 10),
            callback_urls: this.state.callback_urls,
            display_name: this.state.display_name,
            content_type: this.state.content_type,
            description: this.state.description,
            username: this.state.username,
            icon_url: this.state.icon_url,
            id: '',
            token: '',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            creator_id: '',

        };

        this.props.action(hook).then(() => this.setState({saving: false}));
    }

    updateDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            display_name: e.target.value,
        });
    }

    updateDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            description: e.target.value,
        });
    }

    updateContentType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            content_type: e.target.value,
        });
    }

    updateChannelId = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            channel_id: e.target.value,
        });
    }

    updateTriggerWords = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            trigger_words: e.target.value,
        });
    }

    updateTriggerWhen = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            trigger_when: e.target.value,
        });
    }

    updateCallbackUrls = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            callback_urls: e.target.value,
        });
    }

    updateUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            username: e.target.value,
        });
    }

    updateIconURL = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            icon_url: e.target.value,
        });
    }

    render() {
        const contentTypeOption1 = 'application/x-www-form-urlencoded';
        const contentTypeOption2 = 'application/json';

        const headerToRender = this.props.header;
        const footerToRender = this.props.footer;
        const renderExtra = this.props.renderExtra;

        return (
            <div className='backstage-content'>
                <BackstageHeader>
                    <Link to={`/${this.props.team.name}/integrations/outgoing_webhooks`}>
                        <FormattedMessage
                            id='installed_outgoing_webhooks.header'
                            defaultMessage='Outgoing Webhooks'
                        />
                    </Link>
                    <FormattedMessage
                        id={headerToRender.id}
                        defaultMessage={headerToRender.defaultMessage}
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
                                htmlFor='displayName'
                            >
                                <FormattedMessage
                                    id='add_outgoing_webhook.displayName'
                                    defaultMessage='Title'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <input
                                    id='displayName'
                                    type='text'
                                    maxLength={64}
                                    className='form-control'
                                    value={this.state.display_name}
                                    onChange={this.updateDisplayName}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.displayName.help'
                                        defaultMessage='Specify a title, of up to 64 characters, for the webhook settings page.'
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
                                    id='add_outgoing_webhook.description'
                                    defaultMessage='Description'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <input
                                    id='description'
                                    type='text'
                                    maxLength={500}
                                    className='form-control'
                                    value={this.state.description}
                                    onChange={this.updateDescription}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.description.help'
                                        defaultMessage='Describe your outgoing webhook.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='contentType'
                            >
                                <FormattedMessage
                                    id='add_outgoing_webhook.content_Type'
                                    defaultMessage='Content Type'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <select
                                    className='form-control'
                                    value={this.state.content_type}
                                    onChange={this.updateContentType}
                                >
                                    <option
                                        value={contentTypeOption1}
                                    >
                                        {contentTypeOption1}
                                    </option>
                                    <option
                                        value={contentTypeOption2}
                                    >
                                        {contentTypeOption2}
                                    </option>
                                </select>
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.contentType.help1'
                                        defaultMessage='Specify the content type by which to send the request.'
                                    />
                                </div>
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.contentType.help2'
                                        defaultMessage='For the server to encode the parameters in a URL format in the request body, select application/x-www-form-urlencoded.'
                                    />
                                </div>
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.contentType.help3'
                                        defaultMessage='For the server to format the request body as JSON, select application/json.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='channelId'
                            >
                                <FormattedMessage
                                    id='add_outgoing_webhook.channel'
                                    defaultMessage='Channel'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <ChannelSelect
                                    id='channelId'
                                    value={this.state.channel_id}
                                    onChange={this.updateChannelId}
                                    selectOpen={true}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.channel.help'
                                        defaultMessage='This field is optional if you specify at least one trigger word. Specify the public channel that delivers the payload to the webhook.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='triggerWords'
                            >
                                <FormattedMessage
                                    id='add_outgoing_webhook.triggerWords'
                                    defaultMessage='Trigger Words (One Per Line)'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <textarea
                                    id='triggerWords'
                                    rows={3}
                                    maxLength={1000}
                                    className='form-control'
                                    value={this.state.trigger_words}
                                    onChange={this.updateTriggerWords}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.triggerWords.help'
                                        defaultMessage='Specify the trigger words that send an HTTP POST request to your application.  The trigger can be for the channel, the outgoing webhook, or both. If you select only Channel, trigger words are optional. If you select both, the message must match both values.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='triggerWords'
                            >
                                <FormattedMessage
                                    id='add_outgoing_webhook.triggerWordsTriggerWhen'
                                    defaultMessage='Trigger When'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <select
                                    className='form-control'
                                    value={this.state.trigger_when}
                                    onChange={this.updateTriggerWhen}
                                >
                                    <option
                                        value='0'
                                    >
                                        {localizeMessage('add_outgoing_webhook.triggerWordsTriggerWhenFullWord', 'First word matches a trigger word exactly')}
                                    </option>
                                    <option
                                        value='1'
                                    >
                                        {localizeMessage('add_outgoing_webhook.triggerWordsTriggerWhenStartsWith', 'First word starts with a trigger word')}
                                    </option>
                                </select>
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.triggerWordsTriggerWhen.help'
                                        defaultMessage='Specify when to trigger the outgoing webhook.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                                htmlFor='callbackUrls'
                            >
                                <FormattedMessage
                                    id='add_outgoing_webhook.callbackUrls'
                                    defaultMessage='Callback URLs (One Per Line)'
                                />
                            </label>
                            <div className='col-md-5 col-sm-8'>
                                <textarea
                                    id='callbackUrls'
                                    rows={3}
                                    maxLength={1000}
                                    className='form-control'
                                    value={this.state.callback_urls}
                                    onChange={this.updateCallbackUrls}
                                />
                                <div className='form__help'>
                                    <FormattedMessage
                                        id='add_outgoing_webhook.callbackUrls.help'
                                        defaultMessage='Specify the URL that the messages will be sent to. If the URL is private, add it as a {link}.'
                                        values={{
                                            link: (
                                                <a
                                                    href='https://docs.mattermost.com/configure/configuration-settings.html#session-lengths'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    <FormattedMessage
                                                        id='add_outgoing_webhook.callbackUrls.helpLinkText'
                                                        defaultMessage='trusted internal connection'
                                                    />
                                                </a>
                                            ),
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        {this.props.enablePostUsernameOverride &&
                            <div className='form-group'>
                                <label
                                    className='control-label col-sm-4'
                                    htmlFor='username'
                                >
                                    <FormattedMessage
                                        id='add_outgoing_webhook.username'
                                        defaultMessage='Username'
                                    />
                                </label>
                                <div className='col-md-5 col-sm-8'>
                                    <input
                                        id='username'
                                        type='text'
                                        maxLength={22}
                                        className='form-control'
                                        value={this.state.username}
                                        onChange={this.updateUsername}
                                    />
                                    <div className='form__help'>
                                        <FormattedMessage
                                            id='add_outgoing_webhook.username.help'
                                            defaultMessage='Specify the username this integration will post as. Usernames can be up to 22 characters, and contain lowercase letters, numbers and the symbols \"-\", \"_\", and \".\". If left blank, the name specified by the webhook creator is used.'
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        {this.props.enablePostIconOverride &&
                            <div className='form-group'>
                                <label
                                    className='control-label col-sm-4'
                                    htmlFor='iconURL'
                                >
                                    <FormattedMessage
                                        id='add_outgoing_webhook.icon_url'
                                        defaultMessage='Profile Picture'
                                    />
                                </label>
                                <div className='col-md-5 col-sm-8'>
                                    <input
                                        id='iconURL'
                                        type='text'
                                        maxLength={1024}
                                        className='form-control'
                                        value={this.state.icon_url}
                                        onChange={this.updateIconURL}
                                    />
                                    <div className='form__help'>
                                        <FormattedMessage
                                            id='add_outgoing_webhook.icon_url.help'
                                            defaultMessage='Enter the URL of a .png or .jpg file for this integration to use as the profile picture when posting. The file should be at least 128 pixels by 128 pixels. If left blank, the profile picture specified by the webhook creator is used.'
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        <div className='backstage-form__footer'>
                            <FormError
                                type='backstage'
                                errors={[this.props.serverError, this.state.clientError]}
                            />
                            <Link
                                className='btn btn-link btn-sm'
                                to={`/${this.props.team.name}/integrations/outgoing_webhooks`}
                            >
                                <FormattedMessage
                                    id='add_outgoing_webhook.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Link>
                            <SpinnerButton
                                className='btn btn-primary'
                                type='submit'
                                spinning={this.state.saving}
                                spinningText={localizeMessage(this.props.loading.id, this.props.loading.defaultMessage)}
                                onClick={this.handleSubmit}
                                id='saveWebhook'
                            >
                                <FormattedMessage
                                    id={footerToRender.id}
                                    defaultMessage={footerToRender.defaultMessage}
                                />
                            </SpinnerButton>
                            {renderExtra}
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
