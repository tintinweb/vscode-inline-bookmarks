[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>


# Inline Bookmarks

<img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/69679883-91366500-10a9-11ea-8e36-ba3e799127b3.png">

Code navigation for inline bookmarks made easy.

* Specify words inside your documents that are highlighted as bookmarks in the IDE. 
* Easily navigate to bookmarks from the **Inline Bookmarks View** added to the Explorer Panel. 

Other extensions allow you to set bookmarks with some clicks in the IDE. With Inline Bookmarks you specify custom trigger words inside your documents that are automatically turned into VSCode Bookmarks. They will show up with a customizable gutter icon next to the code lines and are highlighted within the code. Decorations can be customized. An **Inline Bookmarks** View in the Explorer Panel helps you keep track of all your bookmarks. Navigating to the bookmark location is as easy as clicking on an item in the view.

The extension can be used to keep track of development notes and todo's, for document review, as well as log analysis and auditing purposes. Since bookmarks are stored with your documents you can easily share your notes and bookmarks with others.

## Tour

<img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/69009240-d5ac5d00-0953-11ea-811e-f7fded9c6ecb.png">

![vscode-inline-bookmarks-2](https://user-images.githubusercontent.com/2865694/69681775-67803c80-10af-11ea-8e99-c79caf7781a5.gif)


#### Customizable Inline Bookmarks

* the following bookmark styles are provided by default: red, green, blue, purple

    <img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/69679883-91366500-10a9-11ea-8e36-ba3e799127b3.png">

**Note:** Additional custom styles can be added in the extension settings. See [Expert](#expert) options.

* the following default trigger words/tags are configured by default:
  * `@todo` - (blue) General ToDo remark.
  * `@note` - (blue) General remark.
  * `@remind` - (blue) General remark.
  * `@follow-up` - (blue) General remark.
  * `@audit` - (red) General bookmark for potential issues.
  * `@audit-info` - (blue) General bookmark for information to be noted for later use.
  * `@audit-ok` - (green) Add a note that a specific line is not an issue even though it might look like.
  * `@audit-issue` - (purple) Reference a code location an issue was filed for.

**Note:** Words can be fully customized in: `code → preferences → Extensions: Inline Bookmarks`.
**Note:** Keyboard shortcuts can be assigned in: `code → preferences → keyboard shortcuts`.

<img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/69680065-1457bb00-10aa-11ea-853b-c36fdfc68b96.png">

#### Filterable Bookmarks Finder

command: `inlineBookmarks.showSelectBookmark`

<img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/81169692-8b6a7700-8f99-11ea-9ab2-8b121154c99a.gif">

#### Bookmarks View

* click on a bookmark to jump to its location
* click refresh to re-scan loaded files for changes
* toggle to only show bookmarks for visible editors
* the bookmarks view will follow your cursor location in the editor. the follow mode can be changed with the configuration option `inline-bookmarks.view.followMode`.
* jump to next/previous bookmark with commands `inlineBookmarks.jumpToNext`, `inlineBookmarks.jumpToPrevious` (assign your own keyboard shortcut in vscode preferences) 
* apply custom filter to bookmarks view with command `inlineBookmarks.setTreeViewFilterWords`.
  * empty list unsets filter
  * takes space- or semicolon-delimited list of regular expressions applied on the items label.
  * affects `jumpToNext`, `jumpToPrevious`
  
Buttons (left to right):
- Jump to previous bookmark.
- Jump to next bookmark.
- Filter bookmark view: the prompt accepts regular expressions. keep empty to disable filtering.
- Toggle: show bookmark for visible editors only.
- Quick Refresh: refreshes the bookmark from the internal cache.
- Scan Workspace for Bookmarks: scans all documents in the workspace for bookmark tags

 <img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/103533925-44b57f80-4e8e-11eb-8602-8fda358c8961.png">


## Expert

* reset the internal bookmarks state: `inlineBookmarks.debug.state.reset`
  * bookmarks view is populated when files containing bookmarks are openend in the editor
* go to the extension settings: `code → preferences → Extensions: Inline Bookmarks`
* Exceptions
  * configure file-extensions to be exempt from decoration
  * configure temporary overrides for trigger words to be exempt from decoration (matches begin of word)
* Custom Styles
  * be aware that existing styles can be overridden
  * `gutterIconPath` may refer to only the four images provided with the extension right now: `images/bookmark-{red,green,blue,purple}.svg`. See example below.
  * `gutterIconColor` may be used to specify a custom icon color using any RGBA format. gutterIconColor will override gutterIconPath. See example below.
* Custom word mappings
  * You can assign multiple regex trigger words to a decoration style. See example below.

**Example style definition:** (all vscode style properties are allowed)

```json
"inline-bookmarks.expert.custom.styles": {
    "default": {
        "gutterIconPath": "images/bookmark-blue.svg",
        "overviewRulerColor": "rgba(21, 126, 251, 0.7)",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "red": {
        "gutterIconPath": "images/bookmark-red.svg",
        "gutterIconColor": "#F44336",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "blue": {
        "gutterIconPath": "images/bookmark-blue.svg",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "green": {
        "gutterIconPath": "images/bookmark-green.svg",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "purple": {
        "gutterIconPath": "images/bookmark-purple.svg",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "warn": {   // example custom style with yellow color
        "gutterIconColor": "#F4F400",
        "overviewRulerColor": "#F4F400B0",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    }
}
```

**Example word mapping:** (all vscode style properties are allowed)

```json
"inline-bookmarks.expert.custom.words.mapping": {
    "blue": ["@audit\\-info[ \\t\\n]"],
    "purple": ["@audit\\-issue[ \t\\n]"],
    "green": ["@audit\\-ok[ \\t\\n]"],
    "red": ["@audit[ \\t\\n]"]
}
```

* Note: gutter icons are hardcoded at this time.
 
## Release Notes

see [CHANGELOG](./CHANGELOG.md)

-----------------------------------------------------------------------------------------------------------
