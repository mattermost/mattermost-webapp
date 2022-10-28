// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

interface PreviewSectionProps {
    className?: string;
    message: string;
    items: Array<{id: string; name: string; illustration?: string}>;

    onUpdateIllustration: (illustration: string) => void;
}

const PreviewSection = styled((props: PreviewSectionProps) => {
    const {formatMessage} = useIntl();

    const updateIllustration = (e: React.MouseEvent<HTMLAnchorElement>, illustration: string) => {
        e.preventDefault();

        props.onUpdateIllustration(illustration);
    };

    return (
        <div className={props.className}>
            <p>
                {props.message}
            </p>
            <span className='included-title'>{formatMessage({id: 'worktemplates.preview.section.included', defaultMessage: 'Included'})}</span>
            <ul>
                {props.items.map((c) => (
                    <li key={c.id}>
                        <a
                            href='#'
                            onClick={(e) => updateIllustration(e, c.illustration || '')}
                        >
                            {c.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
})`
    .included-title {
        text-transform: uppercase;
        color: rgba(var(--center-channel-color-rgb), 0.56);
        font-weight: 600;
    }
`;

export default PreviewSection;
