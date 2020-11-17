// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default function Attaching(): JSX.Element {
    return (
        <div>
            <h1 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.title'
                    defaultMessage='Attaching Files'
                />
            </h1>
            <hr/>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.methods.title'
                    defaultMessage='Attachment Methods'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.attaching.methods.description'
                    defaultMessage='Attach a file by drag and drop or by clicking the attachment icon in the message input box.'
                />
            </p>
            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.dragdrop.title'
                    defaultMessage='Drag and Drop'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='help.attaching.dragdrop.description'
                    defaultMessage='Upload a file or selection of files by dragging the files from your computer into the right-hand sidebar or center pane. Dragging and dropping attaches the files to the message input box, then you can optionally type a message and press **ENTER** to post.'
                />
            </p>
            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.icon.title'
                    defaultMessage='Attachment Icon'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='help.attaching.icon.description'
                    defaultMessage='Alternatively, upload files by clicking the grey paperclip icon inside the message input box. This opens up your system file viewer where you can navigate to the desired files and then click **Open** to upload the files to the message input box. Optionally type a message and then press **ENTER** to post.'
                />
            </p>
            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.pasting.title'
                    defaultMessage='Pasting Images'
                />
            </h4>
            <p>
                <FormattedMessage
                    id='help.attaching.pasting.description'
                    defaultMessage='On Chrome and Edge browsers, it is also possible to upload files by pasting them from the clipboard. This is not yet supported on other browsers.'
                />
            </p>

            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.previewer.title'
                    defaultMessage='File Previewer'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.attaching.previewer.description'
                    defaultMessage='Mattermost has a built in file previewer that is used to view media, download files and share public links. Click the thumbnail of an attached file to open it in the file previewer.'
                />
            </p>

            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.publicLinks.title'
                    defaultMessage='Sharing Public Links'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='help.attaching.publicLinks.description'
                    defaultMessage='Public links allow you to share file attachments with people outside your Mattermost team. Open the file previewer by clicking on the thumbnail of an attachment, then click **Get Public Link**. This opens a dialog box with a link to copy. When the link is shared and opened by another user, the file will automatically download.'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.attaching.publicLinks2'
                    defaultMessage='If **Get Public Link** is not visible in the file previewer and you prefer the feature enabled, you can request that your System Admin enable the feature from the System Console under **Security** > **Public Links**.'
                />
            </p>
            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.downloading.title'
                    defaultMessage='Downloading Files'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='help.attaching.downloading.description'
                    defaultMessage='Download an attached file by clicking the download icon next to the file thumbnail or by opening the file previewer and clicking **Download**.'
                />
            </p>
            <h4 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.supported.title'
                    defaultMessage='Supported Media Types'
                />
            </h4>
            <p>
                <FormattedMessage
                    id='help.attaching.supported.description'
                    defaultMessage='If you are trying to preview a media type that is not supported, the file previewer will open a standard media attachment icon. Supported media formats depend heavily on your browser and operating system, but the following formats are supported by Mattermost on most browsers:'
                />
            </p>
            <ul>
                <li>
                    <FormattedMessage
                        id='help.attaching.supportedListItem1'
                        defaultMessage='Images: BMP, GIF, JPG, JPEG, PNG'
                    />
                </li>
                <li>
                    <FormattedMessage
                        id='help.attaching.supportedListItem2'
                        defaultMessage='Video: MP4'
                    />
                </li>
                <li>
                    <FormattedMessage
                        id='help.attaching.supportedListItem3'
                        defaultMessage='Audio: MP3, M4A'
                    />
                </li>
                <li>
                    <FormattedMessage
                        id='help.attaching.supportedListItem4'
                        defaultMessage='Documents: PDF'
                    />
                </li>
            </ul>
            <p>
                <FormattedMessage
                    id='help.attaching.notSupported'
                    defaultMessage='Document preview (Word, Excel, PPT) is not yet supported.'
                />
            </p>

            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.attaching.limitations.title'
                    defaultMessage='File Size Limitations'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.attaching.limitations.description'
                    defaultMessage='Mattermost supports a maximum of five attached files per post, each with a maximum file size of 50Mb.'
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
                            defaultMessage='Formatting Messages Using Markdown'
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
