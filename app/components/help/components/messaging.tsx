// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default function Messaging(): JSX.Element {
    return (
        <div>
            <h1 className='markdown__heading'>
                <FormattedMessage
                    id='help.messaging.title'
                    defaultMessage='Messaging Basics'
                />
            </h1>
            <hr/>
            <p>
                <FormattedMarkdownMessage
                    id='help.messaging.write'
                    defaultMessage='**Write messages** using the text input box at the bottom of Mattermost. Press ENTER to send a message. Use SHIFT+ENTER to create a new line without sending a message.'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.messaging.reply'
                    defaultMessage='**Reply to messages** by clicking the reply arrow next to the message text.'
                />
            </p>
            <p>
                <img
                    src='https://docs.mattermost.com/_images/replyIcon.PNG'
                    alt='reply arrow'
                    className='markdown-inline-img'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.messaging.notify'
                    defaultMessage='**Notify teammates** when they are needed by typing `@username`.'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.messaging.format'
                    defaultMessage='**Format your messages** using Markdown that supports text styling, headings, links, emoticons, code blocks, block quotes, tables, lists and in-line images.'
                />
            </p>
            <p>
                <img
                    src='https://docs.mattermost.com/_images/messagesTable1.PNG'
                    alt='markdown'
                    className='markdown-inline-img'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.messaging.emoji'
                    defaultMessage={'**Quickly add emoji** by typing ":", which will open an emoji autocomplete. If the existing emoji don\'t cover what you want to express, you can also create your own [Custom Emoji](!http://docs.mattermost.com/help/settings/custom-emoji.html).'}
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.messaging.attach'
                    defaultMessage='**Attach files** by dragging and dropping into Mattermost or clicking the attachment icon in the text input box.'
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
                            defaultMessage='Formatting Messages Using Markdown'
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
                <li>
                    <Link to='/help/commands'>
                        <FormattedMessage
                            id='help.link.commands'
                            defaultMessage='Executing Commands'
                        />
                    </Link>
                </li>
            </ul>
        </div>
    );
}
