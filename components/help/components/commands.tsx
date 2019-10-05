// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default function HelpCommands() {
    return (
        <div>
            <h1 className='markdown__heading'>
                <FormattedMessage
                    id='help.commands.title'
                    defaultMessage='Executing Commands'
                />
            </h1>

            <hr/>

            <p>
                <FormattedMarkdownMessage
                    id='help.commands.intro1'
                    defaultMessage='Slash commands perform operations in Mattermost by typing into the text input box. Enter a `/` followed by a command and some arguments to perform actions.'
                />
            </p>

            <p>
                <FormattedMarkdownMessage
                    id='help.commands.intro2'
                    defaultMessage='Built-in slash commands come with all Mattermost installations and custom slash commands are configurable to interact with external applications. Learn about configuring custom slash commands on the [developer slash command documentation page](!http://docs.mattermost.com/developer/slash-commands.html).'
                />
            </p>

            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.commands.builtin.title'
                    defaultMessage='Built-in Commands'
                />
            </h2>

            <p>
                <FormattedMessage
                    id='help.commands.builtin.description'
                    defaultMessage='The following slash commands are available on all Mattermost installations:'
                />
            </p>

            <p>
                <img
                    src='https://s3.amazonaws.com/images.mattermost.com/slashCommandsTable1.png'
                    alt='commands'
                    className='markdown-inline-img'
                />
            </p>
            <p>
                <img
                    src='https://s3.amazonaws.com/images.mattermost.com/slashCommandsTable2.png'
                    alt='commands'
                    className='markdown-inline-img'
                />
            </p>

            <p>
                <FormattedMarkdownMessage
                    id='help.commands.builtin2'
                    defaultMessage='Begin by typing `/` and a list of slash command options appears above the text input box. The autocomplete suggestions help by providing a format example in black text and a short description of the slash command in grey text.'
                />
            </p>

            <p>
                <img
                    src='https://docs.mattermost.com/_images/slashCommandsAutocomplete.PNG'
                    alt='autocomplete'
                    className='markdown-inline-img'
                />
            </p>

            <h2 className='markdown__heading'>
                <FormattedMarkdownMessage
                    id='help.commands.custom.title'
                    defaultMessage='Custom Commands'
                />
            </h2>

            <p>
                <FormattedMarkdownMessage
                    id='help.commands.custom.description'
                    defaultMessage='Custom slash commands integrate with external applications. For example, a team might configure a custom slash command to check internal health records with `/patient joe smith` or check the weekly weather forecast in a city with `/weather toronto week`. Check with your System Admin or open the autocomplete list by typing `/` to determine if your team configured any custom slash commands.'
                />
            </p>

            <p>
                <FormattedMarkdownMessage
                    id='help.commands.custom2'
                    defaultMessage='Custom slash commands are disabled by default and can be enabled by the System Admin in the **System Console** > **Integrations** > **Webhooks and Commands**. Learn about configuring custom slash commands on the [developer slash command documentation page](!http://docs.mattermost.com/developer/slash-commands.html).'
                />
            </p>

            <p className='links'>
                <FormattedMessage
                    id='help.learnMore'
                    defaultMessage='Learn more about:'
                />
            </p>
            <ul>
                <li>
                    <Link to='/help/messaging'>
                        <FormattedMessage
                            id='help.link.messaging'
                            defaultMessage='Basic Messaging'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/composing'>
                        <FormattedMessage
                            id='help.link.composing'
                            defaultMessage='Composing Messages and Replies'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/mentioning'>
                        <FormattedMessage
                            id='help.link.mentioning'
                            defaultMessage='Mentioning Teammates'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/formatting'>
                        <FormattedMessage
                            id='help.link.formatting'
                            defaultMessage='Formatting Messages using Markdown'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/attaching'>
                        <FormattedMessage
                            id='help.link.attaching'
                            defaultMessage='Attaching Files'
                        />
                    </Link>
                </li>
            </ul>
        </div>
    );
}
