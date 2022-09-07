// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import './section_creator.scss';

type Props = {
    title: {
        id: string;
        defaultMessage: string;
    };
    description?: {
        id: string;
        defaultMessage: string;
    };
    content: JSX.Element;
};

function SectionCreator({
    title,
    description,
    content,
}: Props): JSX.Element {
    const Title = (
        <div className='mm-modal-generic-section__title'>
            <FormattedMessage
                id={title.id}
                defaultMessage={title.defaultMessage}
            />
        </div>
    );

    const Description = description && (
        <div className='mm-modal-generic-section__description'>
            <FormattedMessage
                id={description.id}
                defaultMessage={description.defaultMessage}
            />
        </div>
    );

    return (
        <section className='mm-modal-generic-section'>
            {Title}
            {Description}
            {content}
        </section>
    );
}

export default SectionCreator;
