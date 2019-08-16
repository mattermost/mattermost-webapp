// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

type Props = {
    id?: string,
    className: string,
    onHeaderClick?: React.EventHandler<React.MouseEvent>,
    titleId: string,
    titleDefault: string,
    subtitleId: string,
    subtitleDefault: string,
    subtitleValues?: any,
    button?: React.ReactNode,
    children?: React.ReactNode,
};

const AdminPanel = (props: Props) => (
    <div
        className={'AdminPanel ' + props.className}
        id={props.id}
    >
        <div
            className='header'
            onClick={props.onHeaderClick}
        >
            <div>
                <h3>
                    <FormattedMessage
                        id={props.titleId}
                        defaultMessage={props.titleDefault}
                    />
                </h3>
                <span>
                    <FormattedMarkdownMessage
                        id={props.subtitleId}
                        defaultMessage={props.subtitleDefault}
                        values={props.subtitleValues}
                    />
                </span>
            </div>
            {props.button &&
                <div className='button'>
                    {props.button}
                </div>
            }
        </div>
        {props.children}
    </div>
);

AdminPanel.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string.isRequired,
    id: PropTypes.string,
    titleId: PropTypes.string.isRequired,
    titleDefault: PropTypes.string.isRequired,
    subtitleId: PropTypes.string.isRequired,
    subtitleDefault: PropTypes.string.isRequired,
    subtitleValues: PropTypes.object,
    onHeaderClick: PropTypes.func,
    button: PropTypes.node,
};

AdminPanel.defaultProps = {
    className: '',
};

export default AdminPanel;
