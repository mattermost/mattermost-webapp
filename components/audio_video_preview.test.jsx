// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AudioVideoPreview from 'components/audio_video_preview.jsx';

describe('component/AudioVideoPreview', () => {
    const requiredProps = {
        fileInfo: {
            extension: 'mov',
            id: 'file_id',
        },
        fileUrl: '/api/v4/files/file_id',
    };

    test('should match snapshot without children', () => {
        const wrapper = shallow(
            <AudioVideoPreview {...requiredProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, cannot play', () => {
        const wrapper = shallow(
            <AudioVideoPreview {...requiredProps}/>,
        );
        wrapper.setState({canPlay: false});
        expect(wrapper).toMatchSnapshot();
    });
});
