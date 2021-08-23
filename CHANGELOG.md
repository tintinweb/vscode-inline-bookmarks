# Change Log

## 0.0.24
- new: support for custom colored bookmarks. More information see [Readme.md/Expert/Custom Styles and Mapping](./README.md#expert) Settings - see #30, #42 (thanks @rkodey 🙌)
- new: `inline-bookmarks.view.lineMode` allows to specify the behavior when jumping to the next/previous bookmark. Either use the current `selected-bookmark` or the `current-line` selected in the editor as the reference for the next jump. - see #40, #41 (thanks @rkodey 🙌)
- fixed: jump errors due to vscode api misuse - see #38, #39 (thanks @rkodey 🙌)

## 0.0.23
- new: Color indicators for the overview ruler `overviewRulerColor` for all tags - #35

## 0.0.22
- new: command `List Visible Bookmarks` prints bookmarks for currently visible editors (use `List Bookmarks` if you want to print all bookmarks)
- new: command `Select Visible Bookmark` that allows to quickly jump to bookmarks in currently visible editors (use `Select Bookmark` if you want to select from an unfiltered list)

## 0.0.21
- fixed: an update to vscode caused the list-view selection tracking to fail with "cannot read property '_uri'  of undefined" - see #33 

## 0.0.20
- new: new quick actions to bookmarks view - #20
  - Jump to Previous/Next, Filter View, Scan Workspace for Bookmarks (slow)
  - renamed "Set View Filter" to "Filter View ..."
  - updated "Filter View ..." prompt with a note that an empty filter disables filtering
  
Buttons (left to right):
- Jump to previous bookmark.
- Jump to next bookmark.
- Filter bookmark view: the prompt accepts regular expressions. keep empty to disable filtering.
- Toggle: show bookmark for visible editors only.
- Quick Refresh: refreshes the bookmark from the internal cache.
- Scan Workspace for Bookmarks: scans all documents in the workspace for bookmark tags

 ![image](https://user-images.githubusercontent.com/2865694/103533925-44b57f80-4e8e-11eb-8602-8fda358c8961.png)

 

## 0.0.19
- new: command to list all bookmarks (text)
- new: experimental command to scan workspace for bookmarks
  - note: don't use this on large workspaces. if it breaks use the `onCommand:inlineBookmarks.debug.state.reset` command from the command palette
- fixed: listview filter not working correctly - #24

## 0.0.18
- fixed: extension not fully registered if vscode is slow or editor not set
  - may manifest as cross-extension incompatibility as reported with #17

## 0.0.17
- new: added functionality to quickly filter the list of bookmarks `inlineBookmarks.showSelectBookmark` #11
- fixed: multiple issues where tree items or bookmarks where undefined #16
- new: debug command to reset the stored bookmarks read from workspace. in case the workspace is corrupt. `inlineBookmarks.debug.state.reset` #16

## 0.0.16
- new: added commands to jump to next/previous bookmark: `inlineBookmarks.jumpToNext` `inlineBookmarks.jumpToPrevious` #12
  - **Note**: keyboard shortcuts can be configured in `code -> preferences -> keyboard shortcuts` #15
- new: added functionality to filter the bookmark view #14
- fixed: remove `jumpToLine` from command menu #13

## 0.0.15
- fixed: treeview item id(0) error
- new: set `inline-bookmarks.view.words.hide` to hide tags/trigger words in bookmarks view (only for entries with additional text)

## 0.0.14
- fixed: wrong treeview item selected #7

## 0.0.13
- allow to specify bookmarks view follow behavior: `inline-bookmarks.view.followMode`
  - `nearest` - highlights the nearest bookmark (relative distance)
  - `chapter` - highlights the most recent bookmark or the bookmark that is on the current line.

## 0.0.12

- new: sync the bookmarks view with the editor click action (highlight nearest)
- fixed: sort bookmarks view by line number

## 0.0.11

- fixed: icon not shown in bookmark view on Windows
- fixed: bookmark view does not refresh on Windows

## 0.0.10

- fixed: errors due to assignment to const
- added: dark theme icons
- fixed: make clear that the refresh button only reloads known bookmarks and does not scan all files in the workspace

## 0.0.9

- changed: when set, show all visible editor files bookmarks in bookmarks view
- new: allow to define bookmark view behavior as initially collapsed (default) or expanded. 
  - Code -> Preferences -> Settings `inline-bookmarks.view.expanded`
  - Or, run command: `Toggle: Keep File View expanded` (`inlineBookmarks.toggleViewKeepFilesExpanded`)

## 0.0.8
- new: toggle Inline Bookmark view to only show bookmarks of active file vs. all files
  - by default shows all files

## 0.0.7
- new: configuration options
  - disable decorations
  - blacklist files-extensions that should not be decorated
  - blacklist words that should be temporarily ignored from decoration
  - hard-code default styles but allow to override them in the configuration
  - expose trigger words for default styles and allow to customize them
  - allow users to configure new styles and map trigger words to them
- fix: bookmarks view: did not auto-refresh on load
- fix: pattern for audit-issue
- fix: clear empty bookmarks

## 0.0.6
- fix: "rejected promise not handled ..."

## 0.0.4 - 0.0.5
- fix: bookmarks view: files are not removed when all bookmarks are deleted

## 0.0.3
- bookmarks view: sort list of files
- bookmarks view: added refresh button to refresh tracked files
- fix: output window shows up in bookmarks view

## 0.0.1 - 0.0.2
- Initial release
- customizable inline bookmarks
- code decorations (highlights the bookmark tags, gutter icon)
- Inline Bookmarks View
