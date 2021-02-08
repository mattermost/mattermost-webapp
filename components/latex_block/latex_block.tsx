// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import {FormattedMessage} from 'react-intl';
import katex from 'katex';

type Props = {
    content: string;
    enableLatex: boolean;
};

type KatexOptions = {
    throwOnError?: boolean;
    displayMode?: boolean;
    maxSize?: number;
    maxExpand?: number;
    fleqn?: boolean;
};

type Output = {
    latex: string;
};

type Error = {
    active: boolean;
    id: string;
    defaultMessage: string;
};

function LatexBlock({
    content,
    enableLatex = false,
}: Props): JSX.Element {
    const [katexOptions, setKatexOptions] = useState<KatexOptions>();

    const [output, setOutput] = useState<Output>({
        latex: '',
    });

    const [error, setError] = useState<Error>({
        active: false,
        id: 'katex.error',
        defaultMessage: "Couldn't compile your Latex code. Please review the syntax and try again.",
    });

    useEffect(() => {
        try {
            setKatexOptions({
                throwOnError: false,
                displayMode: true,
                maxSize: 200,
                maxExpand: 100,
                fleqn: true,
            });

            setOutput({
                latex: katex.renderToString(content, katexOptions),
            });
        } catch (e) {
            setError({
                ...error,
                active: true,
            });
        }
    }, []);

    return (
        <div className='post-body--code tex'>
            {!enableLatex &&
                <div>
                    {content}
                </div>
            }

            {enableLatex &&
                <div
                    dangerouslySetInnerHTML={{
                        __html: output.latex,
                    }}
                />
            }

            {error.active &&
                <FormattedMessage
                    id={error.id}
                    defaultMessage={error.defaultMessage}
                />
            }
        </div>
    );
}

export default LatexBlock;
