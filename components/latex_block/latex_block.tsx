// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {KatexOptions, renderToString} from 'katex';

type Props = {
    content: string;
    enableLatex: boolean;
};

type State = {
    latex: string;
};

export default class LatexBlock extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            latex: '',
        };
    }

    render() {
        if (!this.props.enableLatex) {
            return (
                <div
                    className='post-body--code tex'
                >
                    {this.props.content}
                </div>
            );
        }

        try {
            const katexOptions: KatexOptions = {
                throwOnError: false,
                displayMode: true,
                maxSize: 200,
                maxExpand: 100,
                fleqn: true,
            };

            this.setState({
                latex: renderToString(this.props.content, katexOptions),
            });

            return (
                <div
                    className='post-body--code tex'
                    dangerouslySetInnerHTML={{__html: this.state.latex}}
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
    }
}
