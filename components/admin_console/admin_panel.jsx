// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

const AdminPanel = (props) => {
    return (
        <div
            className={'admin-panel'}
            id={props.id}
        >
            <div
                className='header'
            >
                <div>
                    <h3>
                        <FormattedMarkdownMessage
                            id={props.titleId}
                            defaultMessage={props.titleDefaultMessage}
                        />
                    </h3>
                    {props.subtitleId && (
                        <span>
                            <FormattedMarkdownMessage
                                id={props.subtitleId}
                                defaultMessage={props.subtitleDefaultMessage}
                            />
                        </span>
                    )}
                </div>
            </div>
            {props.children}
            {props.footer && (<div className='footer'>{props.footer}</div>)}
        </div>
    );
};

AdminPanel.propTypes = {
    id: PropTypes.string.isRequired,
    titleId: PropTypes.string.isRequired,
    titleDefaultMessage: PropTypes.string.isRequired,
    subtitleId: PropTypes.string,
    subtitleDefaultMessage: PropTypes.string,
    children: PropTypes.node,
    footer: PropTypes.node,
};

export default AdminPanel;
