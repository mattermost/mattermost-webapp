import React from 'react';

import {shallow} from 'enzyme';

import ImagePreview from 'components/image_preview';

describe('components/ImagePreview', () => {
    test('should match snapshot', () => {
        const fileInfo = {
            id: '{file_id}',
        };

        const makeWrapper = (fileInfo) => shallow(
            ImagePreview({fileInfo})
        );

        expect(makeWrapper(fileInfo)).toMatchSnapshot();

        fileInfo.has_preview_image = true;
        expect(makeWrapper(fileInfo)).toMatchSnapshot();
    });
});
