// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {KatexOptions, renderToString} from 'katex';

type Props = {
    content: string;
    enableInlineLatex: boolean;
};

export default class LatexInline extends React.PureComponent<Props> {
    render(): React.ReactNode {
        if (!this.props.enableInlineLatex) {
            return (
                <span
                    className='post-body--code inline-tex'
                >
                    {'$' + this.props.content + '$'}
                </span>
            );
        }

        try {
            const katexOptions: KatexOptions = {
                throwOnError: false,
                displayMode: false,
                maxSize: 200,
                maxExpand: 100,
                fleqn: true,
            };

            const html = renderToString(this.props.content, katexOptions);

            return (
                <span
                    className='post-body--code inline-tex'
                    dangerouslySetInnerHTML={{__html: html}}
                />
            );
        } catch (e) {
            return (
                <span
                    className='post-body--code inline-tex'
                >
                    <FormattedMessage
                        id='katex.error'
                        defaultMessage="Couldn't compile your Latex code. Please review the syntax and try again."
                    />
                </span>
            );
        }
    }
}
