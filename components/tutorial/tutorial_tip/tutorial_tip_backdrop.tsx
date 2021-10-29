// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled, {css} from 'styled-components';

export type TutorialTipPunchout = {
    x?: string;
    y?: string;
    width?: string;
    height?: string;
}

const TutorialTipBackdrop = styled.div.attrs(() => ({
    className: 'tip-backdrop',
}))((props: TutorialTipPunchout) => {
    const {x, y, width, height} = props;

    if (!x || !y || !width || !height) {
        return null;
    }

    const vertices = [];

    // draw to top left of punch out
    vertices.push('0% 0%');
    vertices.push('0% 100%');
    vertices.push('100% 100%');
    vertices.push('100% 0%');
    vertices.push(`${x} 0%`);
    vertices.push(`${x} ${y}`);

    // draw punch out
    vertices.push(`calc(${x} + ${width}) ${y}`);
    vertices.push(`calc(${x} + ${width}) calc(${y} + ${height})`);
    vertices.push(`${x} calc(${y} + ${height})`);
    vertices.push(`${x} ${y}`);

    // close off punch out
    vertices.push(`${x} 0%`);
    vertices.push('0% 0%');

    return css`
        clip-path: polygon(${vertices.join(', ')});
    `;
});

export default TutorialTipBackdrop;
