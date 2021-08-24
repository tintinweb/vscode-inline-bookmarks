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


## FaQ

### Q: Where do I find more settings?

Go to `code → preferences → Extensions: Inline Bookmarks`.

### Q: How can I reset the extensions bookmark cache in case of permanent errors?

Bookmarks are cached in the vscode workspace. In case of permanent "ghost entries" or other errors you might want to try to execute the command: `inlineBookmarks.debug.state.reset`. This is going to reset the cache and allow the extension to populate it from scratch. Bookmarks are typically added as you go when opening new files in the editor. You can also make the extension scan the workspace for files containing Bookmarks. We don't do this automatically as it is quite resource intensive.

### Q: How can I control which paths/file-extensions are being processed by the extension?

By default all paths are included (`inline-bookmarks.search.includes`) except the ones defined with `inline-bookmarks.search.excludes` (supports wildcard path globs).

Additionally, file-extensions configured with `inline-bookmarks.exceptions.file.extensions.ignore` will be excluded as well (prefer this over `search.excludes`). 

### Q: How do I temporarily exempt certain trigger-words from being decorated?

See `inline-bookmarks.exceptions.words.ignore` (matches the beginning of the word).

### Q: How can I define custom bookmark trigger-words/labels and colors?

The extension will search for all the default trigger-words configured with the extension. Note that these default trigger-words can be overriden (or removed). In addition, we give you complete freedom over any custom trigger-words you would want to configure. See example.

**Note**

* Existing words and styles can be overriden.
* `gutterIconColor` may be used to specify a custom icon color using any RGBA format. gutterIconColor will override gutterIconPath. See example below.
* (Deprecated) `gutterIconPath` may refer to only the four images provided with the extension right now: `images/bookmark-{red,green,blue,purple}.svg`. See example below. 
* You can assign multiple regex trigger words to a decoration style. See example.

**Example word mapping:** (all vscode style properties are allowed)

```json
"inline-bookmarks.expert.custom.words.mapping": {
    "blue": ["@audit\\-info[ \\t\\n]"],
    "purple": ["@audit\\-issue[ \t\\n]"],
    "green": ["@audit\\-ok[ \\t\\n]"],
    "red": ["@audit[ \\t\\n]"],
    "warn": ["@warn[ \\t\\n]"] 
}
```

**Example style definition:** (all vscode style properties are allowed)

```json
"inline-bookmarks.expert.custom.styles": {
    "default": {
        "gutterIconColor": "#157EFB",
        "overviewRulerColor": "rgba(21, 126, 251, 0.7)",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "red": {
        "gutterIconColor": "#F44336",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "blue": {
        "gutterIconColor": "#157EFB",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "green": {
        "gutterIconColor": "#2FCE7C",
        "light": {
            "fontWeight": "bold"
        },
        "dark": {
            "color": "Chocolate"
        }
    },
    "purple": {
        "gutterIconColor": "#C679E0",
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
 
## Release Notes

see [CHANGELOG](./CHANGELOG.md)

-----------------------------------------------------------------------------------------------------------
