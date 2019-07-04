// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import GenericTeamChannelProvider from 'components/suggestion/generic_team_channel_provider.jsx';
import MenuActionProvider from 'components/suggestion/menu_action_provider';
import AutocompleteSelector from 'components/widgets/settings/autocomplete_selector';
import PostEmoji from 'components/post_emoji';

import {localizeMessage} from 'utils/utils.jsx';

export default class PostAddBotTeamsChannels extends React.PureComponent {
    static propTypes = {

        /*
        * Post containing the user id of the bot
        */
        post: PropTypes.object.isRequired,

        /*
        * List of teams available to the current user
        */
        teams: PropTypes.arrayOf(PropTypes.object).isRequired,

        actions: PropTypes.shape({
            addChannelMember: PropTypes.func.isRequired,
            addUserToTeam: PropTypes.func.isRequired,
            editPost: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {addMode: false};
    }

    handleAddButton = () => {
        this.setState({addMode: true});
    }

    handleSelectedTeam = (selected) => {
        this.setState({selectedTeamName: selected.text, team: selected, selectedChannelName: null, channel: null});
    }

    handleSelectedChannel = async (selected) => {
        await this.setState({selectedChannelName: selected.display_name, channel: selected});

        await this.props.actions.addUserToTeam(this.state.team.value, this.props.post.user_id);
        await this.props.actions.addChannelMember(this.state.channel.id, this.props.post.user_id);

        // Check to see if we've already added the bot to the channel, it doesn't need to show up twice
        var currentAddedChannels = this.props.post.props.addedChannels;
        if (currentAddedChannels) {
            var channelAlreadyExists = currentAddedChannels.find((c) => c.id === this.state.channel.id);
            if (!channelAlreadyExists) {
                currentAddedChannels = currentAddedChannels.concat([{
                    id: this.state.channel.id,
                    name: this.state.selectedChannelName,
                }]);
            }
        } else {
            currentAddedChannels = [{
                id: this.state.channel.id,
                name: this.state.selectedChannelName,
            }];
        }

        const post = {
            id: this.props.post.id,
            props: {
                addedChannels: currentAddedChannels,
            },
        };

        this.props.actions.editPost(post);
    }

    render() {
        // Add button markup
        let addButton;
        if (!this.state.addMode) {
            addButton = (
                <Button
                    id='api.bot.teams_channels.add_button'
                    type='submit'
                    bsStyle='primary'
                    onClick={this.handleAddButton}
                >
                    <strong>
                        <FormattedMessage
                            id='api.bot.teams_channels.add_button'
                            defaultMessage='ADD BOT TO TEAMS AND CHANNELS'
                        />
                    </strong>
                </Button>
            );
        }

        // Success message markup
        let successMessage;
        if (this.props.post.props.addedChannels) {
            var channels = this.props.post.props.addedChannels.map((c) => c.name).join(', ');

            successMessage = (
                <div>
                    <PostEmoji
                        name='tada'
                    />
                    &nbsp;
                    <FormattedMarkdownMessage
                        id='api.bot.teams_channels.successful_add'
                        defaultMessage='I was successfully added to **{channelName}**'
                        values={{
                            channelName: channels,
                        }}
                    />
                </div>
            );
        }

        // Select channel menu markup
        let selectChannelMenu;
        if (this.state.selectedTeamName && this.state.team) {
            selectChannelMenu = (
                <AutocompleteSelector
                    providers={[new GenericTeamChannelProvider(this.state.team.value)]}
                    onSelected={this.handleSelectedChannel}
                    placeholder={localizeMessage('api.bot.teams_channels.select_channel', 'Select a channel')}
                    inputClassName='post-attachment-dropdown'
                    value={this.state.selectedChannelName}
                />
            );
        }

        // Full attachment with team selection menu markup
        const {teams} = this.props;
        const teamOptions = teams.map((t) => {
            return {
                text: t.display_name,
                value: t.id,
            };
        });

        let attachment;
        if (this.state.addMode) {
            attachment = (
                <div
                    className='attachment'
                    ref='attachment'
                >
                    <div className='attachment__content'>
                        <div className='clearfix attachment__container'>
                            <div>
                                <div className='attachment__body attachment__body--no_thumb'>
                                    <FormattedMarkdownMessage
                                        id='api.bot.teams_channels.add_message_prompt'
                                        defaultMessage='Please select the **team** and **channel** you would like to add the bot to.'
                                    />
                                    <div className='attachment-actions'>
                                        <AutocompleteSelector
                                            providers={[new MenuActionProvider(teamOptions)]}
                                            onSelected={this.handleSelectedTeam}
                                            placeholder={localizeMessage('api.bot.teams_channels.select_team', 'Select a team')}
                                            inputClassName='post-attachment-dropdown'
                                            value={this.state.selectedTeamName}
                                        />
                                        {selectChannelMenu}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <FormattedMarkdownMessage
                    id='api.bot.teams_channels.add_message'
                    defaultMessage='Please add me to teams and channels you want me to interact in. See [documentation](https://mattermost.com/pl/default-bot-accounts) to learn more.'
                />
                <br/>
                <div className='margin-top margin-bottom'>
                    {addButton}
                    {attachment}
                </div>
                {successMessage}
            </div>
        );
    }
}
