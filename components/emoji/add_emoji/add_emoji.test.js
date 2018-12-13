// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AddEmoji from './add_emoji.jsx';

const context = {router: {}};
const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAB3RJTUUH4AcXEyomBnhW6AAAAm9JREFUeNrtnL9vEmEcxj9cCDUSIVhNgGjaTUppOmjrX1BNajs61n+hC5MMrQNOLE7d27GjPxLs0JmSDk2VYNLBCw0yCA0mOBATHXghVu4wYeHCPc94711y30/e732f54Y3sLBbxEUxYAtYA5aB+0yXasAZcAQcAFdON1kuD+eBBvAG2JhCOJiaNkyNDVPzfwGlgBPgJRDCPwqZmk8MA0dAKeAjsIJ/tWIYpJwA7U9pK43Tevv/Asr7fOc47aR8H1AMyIrJkLJAzDKjPCQejh/uLcv4HMlZa5YxgZKzli1NrtETzRKD0RIgARIgARIgARIgAfKrgl54iUwiwrOlOHOzYQDsZof35w0+ffshQJlEhJ3NxWvX7t66waP5WV69/TxxSBNvsecP74215htA83fCrmv9lvM1oJsh9y4PzwQFqFJvj7XmG0AfzhtjrfkGUMlusXd8gd3sDK7ZzQ57xxeU7NbEAQUWdou/ZQflpAVIgPycxR7P3WbdZLHwTJBKvc3h6aUnspjlBTjZpw9IJ6MDY5hORtnZXCSTiAjQ+lJcWWyU0smostjYJi2gKTYyb3393hGgUXnr8PRSgEp2i0LxC5V6m5/dX4Nd5YW/iZ7xQSW75YlgKictQAKkLKYspiymLKYspiymLKYspiymLCYnraghQAIkCZAACZAACZDHAdWEwVU1i94RMZKzzix65+dIzjqy6B0u1BWLIXWBA4veyUsF8RhSAbjqT7EcUBaTgcqGybUx/0ITrTe5DIshH1QFnvh8J5UNg6qbUawCq8Brn324u6bm1b/hjHLSOSAObAPvprT1aqa2bVNrzummPw4OwJf+E7QCAAAAAElFTkSuQmCC';

describe('components/emoji/components/AddEmoji', () => {
    const baseProps = {
        emojiMap: {
            hasSystemEmoji: jest.fn(() => false),
        },
        team: {
            id: 'team-id',
        },
        user: {
            id: 'current-user-id',
        },
        actions: {
            createCustomEmoji: jest.fn().mockReturnValue({}),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AddEmoji {...baseProps}/>,
            {context}
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('image')).toBeNull();
        expect(wrapper.state('imageUrl')).toEqual('');
        expect(wrapper.state('name')).toEqual('');
    });

    test('should update emoji name and match snapshot', () => {
        const wrapper = shallow(
            <AddEmoji {...baseProps}/>,
            {context}
        );

        const nameInput = wrapper.find('#name');
        nameInput.simulate('change', {target: {name: 'name', value: 'emojiName'}});
        expect(wrapper.state('name')).toEqual('emojiName');
        expect(wrapper).toMatchSnapshot();
    });

    test('should select a file and match snapshot', () => {
        const wrapper = shallow(
            <AddEmoji {...baseProps}/>,
            {context}
        );

        const file = new Blob([image], {type: 'image/png'});
        const onload = jest.fn(() => {
            wrapper.setState({image: file, imageUrl: image});
        });
        const readAsDataURL = jest.fn(() => onload());

        window.FileReader = jest.fn(() => ({
            onload,
            readAsDataURL,
            result: image,
        }));

        const fileInput = wrapper.find('#select-emoji');
        fileInput.simulate('change', {target: {files: []}});
        expect(FileReader).not.toBeCalled();
        expect(wrapper.state('image')).toEqual(null);
        expect(wrapper.state('imageUrl')).toEqual('');

        fileInput.simulate('change', {target: {files: [file]}});
        expect(FileReader).toBeCalled();
        expect(readAsDataURL).toHaveBeenCalledWith(file);
        expect(onload).toHaveBeenCalledTimes(1);
        expect(wrapper.state('image')).toEqual(file);
        expect(wrapper.state('imageUrl')).toEqual(image);
        expect(wrapper).toMatchSnapshot();
    });

    test('should submit the new added emoji', () => {
        const wrapper = shallow(
            <AddEmoji {...baseProps}/>,
            {context}
        );

        const file = new Blob([image], {type: 'image/png'});
        const onload = jest.fn(() => {
            wrapper.setState({image: file, imageUrl: image});
        });
        const readAsDataURL = jest.fn(() => onload());
        const form = wrapper.find('form').first();
        const nameInput = wrapper.find('#name');
        const fileInput = wrapper.find('#select-emoji');

        window.FileReader = jest.fn(() => ({
            onload,
            readAsDataURL,
            result: image,
        }));

        // Submit the form without emoji name or file
        form.simulate('submit', {preventDefault: jest.fn()});
        expect(wrapper.state('saving')).toEqual(false);
        expect(wrapper.state('error')).not.toBeNull();

        // Submit the form without emoji  file
        nameInput.simulate('change', {target: {name: 'name', value: 'emojiName'}});
        form.simulate('submit', {preventDefault: jest.fn()});
        expect(wrapper.state('saving')).toEqual(false);
        expect(wrapper.state('error')).not.toBeNull();

        fileInput.simulate('change', {target: {files: [file]}});
        form.simulate('submit', {preventDefault: jest.fn()});
        expect(wrapper.state('saving')).toEqual(true);
        expect(baseProps.actions.createCustomEmoji).toBeCalled();
    });
});
