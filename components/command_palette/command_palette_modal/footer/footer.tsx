// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import './footer.scss';

function Footer() {
    return (
        <div className='command-palette-footer'>
            <FormattedMarkdownMessage
                id='command_palette.footer.instruction'
                defaultMessage='Use **TAB** to switch filters, **UP/DOWN** to browse, **ENTER** to select, **ESC** to dismiss'
            />
        </div>
    );
}

export default Footer;
