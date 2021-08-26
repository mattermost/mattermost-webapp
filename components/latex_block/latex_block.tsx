// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
interface KatexOptions {
    displayMode?: boolean;
    output?: 'html' | 'mathml' | 'htmlAndMathml';
    leqno?: boolean;
    fleqn?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    minRuleThickness?: number;
    colorIsTextColor?: boolean;
    maxSize?: number;
    maxExpand?: number;
    strict?: boolean | string ;
    globalGroup?: boolean;
}

type Props = {
    content: string;
    enableLatex: boolean;
};

type KatexType = {
    render(tex: string, element: HTMLElement, options?: KatexOptions | undefined): void;
    renderToString(tex: string, options?: KatexOptions | undefined): string;
};

type State = {
    katex: null | KatexType;
}

export default class LatexBlock extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            katex: null,
        };
    }

    componentDidMount(): void {
        import('katex').then((katex) => {
            this.setState({katex});
        });
    }

    render(): React.ReactNode {
        if (!this.props.enableLatex || this.state.katex === null) {
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

            const html = this.state.katex.renderToString(this.props.content, katexOptions);

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
    }
}
