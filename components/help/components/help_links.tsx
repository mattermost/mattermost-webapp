// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as I18n from 'i18n/i18n';

import {useQuery} from 'utils/http_utils';

import {HelpLink} from 'components/help/types';

type Props = {
    excludedLinks?: HelpLink[];
}

type HelpLinkContent = {
    path: string;
    label: string;
}

const HELP_LINK_CONTENT: {[key in HelpLink]: HelpLinkContent} = {
    [HelpLink.Messaging]: {
        path: '/help/messaging',
        label: 'Basic Messaging',
    },
    [HelpLink.Composing]: {
        path: '/help/composing',
        label: 'Composing Messages and Replies',
    },
    [HelpLink.Mentioning]: {
        path: '/help/mentioning',
        label: 'Mentioning Teammates',
    },
    [HelpLink.Formatting]: {
        path: '/help/formatting',
        label: 'Formatting Messages Using Markdown',
    },
    [HelpLink.Attaching]: {
        path: '/help/attaching',
        label: 'Attaching Files',
    },
    [HelpLink.Commands]: {
        path: '/help/commands',
        label: 'Executing Commands',
    },
};

const HelpLinks: React.FC<Props> = ({excludedLinks = []}: Props) => {
    const linksToBeRendered: HelpLink[] = Object.values(HelpLink).
        filter((link: HelpLink) => !excludedLinks.includes(link));

    // If the current page has locale query param in it, we want to preserve it when navigating to any of the help pages
    let localeQueryParam = '';
    const currentLocaleFromQueryParam = useQuery().get('locale');
    if (currentLocaleFromQueryParam && I18n.isLanguageAvailable(currentLocaleFromQueryParam)) {
        localeQueryParam = `?locale=${currentLocaleFromQueryParam}`;
    }

    return (
        <>
            <p className='links'>
                <FormattedMessage
                    id='help.learnMore'
                    defaultMessage='Learn more about:'
                />
            </p>
            <ul>
                {
                    linksToBeRendered.map((linkType: HelpLink) => {
                        const {path, label}: HelpLinkContent = HELP_LINK_CONTENT[linkType];

                        return (
                            <li key={linkType}>
                                <Link to={`${path}${localeQueryParam}`}>
                                    <FormattedMessage
                                        id={`help.link.${linkType.toLowerCase()}`}
                                        defaultMessage={label}
                                    />
                                </Link>
                            </li>
                        );
                    })
                }
            </ul>
        </>
    );
};

export default HelpLinks;
