# Mattermost Text Pipeline

This is the fourth iteration of Mattermost's styling and rendering system which handles things like Markdown, emojis, at-mentions, and so on. It is designed to be used with Mattermost's fork of Commonmark.js (although not the one that currently exists since we want one that's closer to the original without its own handling for special Mattermost cases).

The reason for calling this the Text Pipeline is because the special Mattermost additions are intended to be applied to an existing Markdown AST as a series of transformations that can be added and removed as necessary throughout the UI. For example, we may wish to allow the use of emoticons and at-mentions in a label or textbox without needing to worry about supporting larger Markdown elements such as tables and images in those same places. This package also provides a custom stringToNode function that wraps plain text in a simple AST so that the transformations can be run entirely without Markdown.

## Implementation Notes

### Abstract Source Trees (AST)

For anyone who hasn't worked with text parsing before, an abstract source tree (AST) is a way of storing parsed input (which in our case is usually a user's message) in a format where it can be worked with and later output for display to a user.

The structure of a Markdown AST will often look very similar to HTML since they both follow the general structure of a written document. When working with Commonmark, that means the AST will start with a root `Node` with the type `document` which contains any number of children that are block elements like `heading` and `paragraph` which in turn have other children like `text` and `link` nodes. Eventually, every branch of the tree will end in a node without any children, and those leaf nodes will often contain a literal representation of their text.

When working with an AST, you'll often generate the AST from raw Markdown, transform it to add new elements, and then finally render it for display. In our case, we'll render the AST into React, but you could theoretically swap in any number of renderers such as the HTML and XML renderers provided by Commonmark itself.

### `custom_inline` and `custom_block` Nodes

Commonmark provides two special types of AST nodes, `custom_inline` and `custom_block`, which are intended for use to make custom elements such as the ones we need for things like at-mentions and so on. However, the only way they provide to attach data to these custom elements is by using their `onEnter` and `onExit` fields, both of which are strings. Generally, the type of the custom node should be included in the `onEnter` field, and if more information about the node is needed, that should be provided by appending a colon and the information to the type. For example, an at mention for the user joe.bob would have its `onEnter` set to `at-mention:joe.bob`.

This may change by the time this package ships since it does seem like it will make it much more difficult to represent some of the elements we previously added custom node types for.

### Commonmark.js Fork

While most of our custom logic is added by AST transformations, we've previously made some minor changes to the Markdown spec that we want to keep supporting to avoid affecting users. These have to be done while generating the AST, so they can't be done after the fact with transformations.

What follows is a non-exhaustive list of areas we differ from the CommonMark spec:

- The line immediately following a list item is treated as a new paragraph if that line does not begin with whitespace. (https://github.com/mattermost/commonmark.js/commit/a15ad70142cefe30682fdb704964d26266c15b42)

    ```
    1. This is a list
    Followed by a paragraph
    ```

- Adding ability to manually specify image sizes (https://github.com/mattermost/commonmark.js/commit/bd0d2330ca682c78c3f0ce86f7849473cac461a5)

    ```
    ![an image](https://example.com/image.png =400x500)
    ```
