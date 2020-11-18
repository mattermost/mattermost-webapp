# Adding Icons

**NOTE: These docs need to be updated**

Simple steps to adding new icons to the Compass Icons font

## Adding Material Design Icons

#### Locate your icon

-   Go to https://materialdesignicons.com/ and search for the icon you want to add (stick to outline icon styles as per our [iconography](https://zeroheight.com/29be2c109/p/19c648-iconography) guide)
-   Download the icon as ".SVG Optimized"

#### **Determine the Character code**

-   Locate the hexadecimal character code of the icon you just downloaded in the materialdesignicons.com [cheat sheet](https://cdn.materialdesignicons.com/5.3.45/) (use chromes find in page)

## Adding Custom Icons

#### Create your icon

-   Follow the design guide outlined under [Foundations / Iconography](https://zeroheight.com/29be2c109/p/19c648-iconography)
-   Once the icon is ready illustrator, be sure the shape is a single compound path, no extra layers or groups

#### Save and optimize your SVG

-   Choose to "Save As" an "SVG", ensuring to set the "Decimal Places" field is set to a value of "3" (This ensures your shapes are saved out with an accurate level of detail)
-   Click the "SVG Code..." button
-   Copy the entire <path> tag
-   Open the optimized ["SVG Template.svg"](https://drive.google.com/open?id=1mZ1J-jL7WpSCUqTf7Mkd7OmhY--iFARS&authuser=michael.gamble%40mattermost.com&usp=drive_fs) located in the root of the repository in a text editor of your choice
-   Paste the <path> in your clipboard over the path in the template file and save as

#### Naming your custom SVG

-   Try to match the naming conventions used in the material design icon open source [cheetsheet](https://cdn.materialdesignicons.com/5.3.45/)
-   if the icon is the same concept then consider it a replacement and reuse the name (minus the mdi prefix)
-   if its something new, do your best to try and match for example "someconcept-outline.svg" as it would likely follow the outline style

#### Choosing the character code

-   In the same way as the naming, try to reuse the hexadecimal codes in the [cheetsheet](https://cdn.materialdesignicons.com/5.3.45/) if its a replacement icon
-   For anything new we have manually started using the "E800" block of hexadecimal numbers
-   You'll have to open the [demo.html](https://drive.google.com/open?id=1fEKMDa3hdaAunc7g8-inVKxH50PGYymO&authuser=michael.gamble%40mattermost.com&usp=drive_fs) from the repository root and click on the "show codes" checkbox to determine which is the next available in the sequence
-   As you can see in the example above "E814" is the last icon in that "E800" block, so your icons character code should be "E815"

## Adding Jumbo Icons

#### Create your icon

-   Follow the design guide outlined under [Foundations / Iconography](https://zeroheight.com/29be2c109/p/19c648-iconography) (As of writing this Jumbo Icon design guides do not exist but will be included in future iterations - in the interim please consult with the UX Design Team)

#### Naming your jumbo SVG

-   Prefix your file name with "jumbo-" such as "jumbo-attachment-code"

#### Choosing the character code

-   Similar to the custom icons, we have designated the "E900" block of hexadecimal character codes for the jumbo icons.
-   If you open up the demo.html from the repository root and click on "show codes" you'll be able to look through the "E900" block to determine the next available code in the sequence.
-   As you can see in the example above "E90B" is the last icon in that "E900" block, so your icons character code should be "E90C"

## Move and rename

-   Move the downloaded or optimized svg file into the "svgs" folder in the repository location (google drive location linked above)
-   Append the identified hexadecimal character code to the filename after a pipe character e.g. "account-outline|F0013.svg"

## Import a new font

#### Add your new icon to the font

- [add instructions here]

## Update The Repository

- [Aad instructions here]
-   Once the repository is updated, make a post in the Mattermost "[Compass Design System](https://community-daily.mattermost.com/core/channels/compass-design-system)" channel mentioning the "@uxteam" asking for the font to be updated in Figma
