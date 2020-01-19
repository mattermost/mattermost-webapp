// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import './admin_panel.scss';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

type Props = {
    id?: string;
    className: string;
    onHeaderClick?: React.EventHandler<React.MouseEvent>;
    titleId: string;
    titleDefault: string;
    subtitleId: string;
    subtitleDefault: string;
    subtitleValues?: any;
    button?: React.ReactNode;
    children?: React.ReactNode;
};

const AdminPanel: React.FC<Props> = (props: Props) => (
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
                <div className='margin-top'>
                    <FormattedMarkdownMessage
                        id={props.subtitleId}
                        defaultMessage={props.subtitleDefault}
                        values={props.subtitleValues}
                    />
                </div>
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

AdminPanel.defaultProps = {
    className: '',
};

export default AdminPanel;
