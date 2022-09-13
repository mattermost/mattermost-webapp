// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
export type Coords = {
    x?: string;
    y?: string;
}

export type PunchOutCoordsHeightAndWidth = Coords & {
    width: string;
    height: string;
}
