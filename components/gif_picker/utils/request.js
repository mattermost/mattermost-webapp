// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This is a modified version of the code found in the gfycat-sdk project.
// Supported values for options: timeout, method, url, file, payload
export default (options) => {
    return new Promise((resolve, reject) => {
        var timeout = options.timeout || 30000;

        var timer = setTimeout(() => {
            xhr.abort();
            reject(new Error('API request exceeded timeout of', timeout));
        }, timeout);

        var xhr = new XMLHttpRequest();

        function handleError(err) {
            clearTimeout(timer);
            reject(err || new Error('API request failed'));
        }

        function handleResponse() {
            clearTimeout(timer);

            if (xhr.status >= 400) {
                return reject(xhr.status);
            }

            var body = xhr.response;
            try {
                body = JSON.parse(body);
                resolve(body);
            } catch (e) {
                resolve({});
            }
            return null;
        }

        xhr.addEventListener('error', handleError);
        xhr.addEventListener('abort', handleError);
        xhr.addEventListener('load', handleResponse);

        xhr.open(options.method, options.url, true);

        var headers = options.headers || null;
        if (headers) {
            Object.keys(headers).forEach((header) => {
                xhr.setRequestHeader(header, headers[header]);
            });
        }

        if (options.file) {
            xhr.send(options.file);
        } else {
            var data = JSON.stringify(options.payload) || null;

            if (data) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(data);
            } else {
                xhr.send();
            }
        }
    });
};
