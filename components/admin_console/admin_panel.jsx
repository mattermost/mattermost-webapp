// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

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
                        <FormattedMessage
                            id={props.titleId}
                            defaultMessage={props.titleDefaultMessage}
                        />
                    </h3>
                    {props.subtitleId && (
                        <FormattedMarkdownMessage
                            id={props.subtitleId}
                            defaultMessage={props.subtitleDefaultMessage}
                        />
                    )}
                </div>
                {props.action &&
                    <div className='action'>
                        {props.action}
                    </div>
                }
            </div>
            {props.children}
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
    action: PropTypes.node,
};

export default AdminPanel;
