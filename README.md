[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>


<img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/69008976-f4f5bb00-0950-11ea-8a95-ff6a3b1e5207.png">


# Inline Bookmarks   

<img width="350" alt="inline_bookmarks_icon" src="https://user-images.githubusercontent.com/2865694/69009240-d5ac5d00-0953-11ea-811e-f7fded9c6ecb.png">

Code navigation for inline bookmarks made easy.

Other extensions only allow you to specify bookmarks within your IDE. With Inline Bookmarks you can specify trigger words within your documents that are automatically turned into VSCode Bookmarks. They will show up with a customizable gutter icon next to the code lines and trigger words will be highlighted as well. An **Inline Bookmarks` View in the Explorer Pane helps you keep track of all your bookmarks. Navigating to the bookmark is as easy as clicking on an item in the view.

It's really useful to keep track of development notes and todos as well as log analysis, auditing and review purposes. Since bookmarks are mainly stored in your documents you can easily share your notes with others.

## Tour

![vscode-inline-bookmarks](https://user-images.githubusercontent.com/2865694/69009319-7864db80-0954-11ea-8e31-c56edb7f3813.gif)


#### Customizable Inline Bookmarks

* the following default tags are provided (the tags are tailored towards code auditing but can be customized):
  * `@todo` - General ToDo remark
  * `@note` - General remark
  * `@audit` - General bookmark for potential issues.
  * `@audit-info` - General bookmark for information to be noted for later use.
  * `@audit-ok` - Non-Issue bookmark.
  * `@audit-issue` - Confirmed and filed issue.

* decoration styles can be customized with the extension settings.
  * styles can be named. in the example below they are named: `default`, `red`, `blue`, `green`, `purple`.
  * The `gutterIconPath` is not customizable right now. You can only use the bookmark images referenced below.

```json
"inline-bookmarks.styles": {
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
    }
}
```

* tags can be fully customized with the extension settings. 
  * You can assign multiple regex trigger words to a decoration style (see previous bullet point)

```json
"inline-bookmarks.words": {
    "blue": ["@audit\\-info[ \\t\\n]"],
    "purple": ["@audit\\-issue[ \t\\n]"],
    "green": ["@audit\\-ok[ \\t\\n]"],
    "red": ["@audit[ \\t\\n]"]
}
```

* Note: gutter icons are hardcoded atm.

#### Bookmarks View

* click on a bookmark to jump to its location
* click refresh to re-scan loaded files for changes
 

## Release Notes

see [CHANGELOG](./CHANGELOG.md)

-----------------------------------------------------------------------------------------------------------
