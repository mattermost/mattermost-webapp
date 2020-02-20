// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default function HelpComposing(): JSX.Element {
    return (
        <div>
            <h1 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.title'
                    defaultMessage='Sending Messages'
                />
            </h1>
            <hr/>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.types.title'
                    defaultMessage='Message Types'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.composing.types.description'
                    defaultMessage='Reply to posts to keep conversations organized in threads.'
                />
            </p>
            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.posts.title'
                    defaultMessage='Posts'
                />
            </h4>
            <p>
                <FormattedMessage
                    id='help.composing.posts.description'
                    defaultMessage='Posts can be considered parent messages. They are the messages that often start a thread of replies. Posts are composed and sent from the text input box at the bottom of the center pane.'
                />
            </p>
            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.replies.title'
                    defaultMessage='Replies'
                />
            </h4>
            <p>
                <FormattedMessage
                    id='help.composing.replies.description1'
                    defaultMessage='Reply to a message by clicking the reply icon next to any message text. This action opens the right-hand sidebar where you can see the message thread, then compose and send your reply. Replies are indented slightly in the center pane to indicate that they are child messages of a parent post.'
                />
            </p>
            <p>
                <FormattedMessage
                    id='help.composing.replies.description2'
                    defaultMessage='When composing a reply in the right-hand side, click the expand/collapse icon with two arrows at the top of the sidebar to make things easier to read.'
                />
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.posting.title'
                    defaultMessage='Posting a Message'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.composing.posting.description'
                    defaultMessage='Write a message by typing into the text input box, then press ENTER to send it. Use SHIFT+ENTER to create a new line without sending a message. To send messages by pressing CTRL+ENTER go to **Main Menu > Account Settings > Send messages on CTRL+ENTER**.'
                />
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.editing.title'
                    defaultMessage='Editing a Message'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.composing.editing.description'
                    defaultMessage={'Edit a message by clicking the **[...]** icon next to any message text that you\'ve composed, then click **Edit**. After making modifications to the message text, press **ENTER** to save the modifications. Message edits do not trigger new @mention notifications, desktop notifications or notification sounds.'}
                />
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.deleting.title'
                    defaultMessage='Deleting a message'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.composing.deleting.description'
                    defaultMessage={'Delete a message by clicking the **[...]** icon next to any message text that you\'ve composed, then click **Delete**. System and Team Admins can delete any message on their system or team.'}
                />
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.composing.linking.title'
                    defaultMessage='Linking to a message'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.composing.linking.description'
                    defaultMessage='The **Permalink** feature creates a link to any message. Sharing this link with other users in the channel lets them view the linked message in the Message Archives. Users who are not a member of the channel where the message was posted cannot view the permalink. Get the permalink to any message by clicking the **[...]** icon next to the message text > **Permalink** > **Copy Link**.'
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
