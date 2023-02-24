// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useState} from 'react';
import cn from 'classnames';
import styled from 'styled-components';

import * as SyntaxHighlighting from 'utils/syntax_highlighting';
import * as TextFormatting from 'utils/text_formatting';

import 'highlight.js/lib/languages/json';

const Block = styled.div`
    border: 0;
    background: none;
`;

type Props = {
    code: string;
    language: string;
    inline?: boolean;
}

function Json({code, language, inline = true}: Props) {
    const [content, setContent] = useState(TextFormatting.sanitizeHtml(code));

    useEffect(() => {
        SyntaxHighlighting.highlight(language, code).then((content) => setContent(content));
    }, [language, code]);

    return (
        <Block
            className={cn({inline})}
            dangerouslySetInnerHTML={{__html: content}}
        />
    );
}

export default memo(Json);
