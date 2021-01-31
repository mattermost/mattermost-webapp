// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import katex from 'katex';

type Props = {
    content: string;
    enableLatex: boolean;
};

const LatexBlock: React.FC<Props> = ({content, enableLatex = false}: Props) => {
    if (!enableLatex) {
        return (
            <div
                className='post-body--code tex'
            >
                {content}
            </div>
        );
    }

    try {
        const katexOptions = {
            throwOnError: false,
            displayMode: true,
            maxSize: 200,
            maxExpand: 100,
            fleqn: true,
        };
        const html = katex.renderToString(content, katexOptions);

        return (
            <div
                className='post-body--code tex'
                dangerouslySetInnerHTML={{__html: html}}
            />
        );
    } catch (e) {
        return (
            <div
                className='post-body--code tex'
            >
                <FormattedMessage
                    id='katex.error'
                    defaultMessage="Couldn't compile your Latex code. Please review the syntax and try again."
                />
            </div>
        );
    }
};

export default LatexBlock;
