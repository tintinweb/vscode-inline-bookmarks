# Change Log

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
- fix: bokmarks view: did not auto-refresh on load
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
