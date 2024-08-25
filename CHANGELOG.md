# Changelog

## 0.2.11

Attempt to implement [38](https://github.com/CMorooney/obsidian-game-search-plugin/issues/38)
fixes casing mis-match for some games when trying to match
Steam game on note creation

## 0.2.10

Attempt to implement [38](https://github.com/CMorooney/obsidian-game-search-plugin/issues/38)
Match steam game in user's library when creating game note (if setting on)
and inject metadata right then

adjusts placement of toggles in the settings pane to be a little more sensible

fixes typo in readme, adds content that should have been added with `0.2.9`

## 0.2.9

Attempt to implement [34](https://github.com/CMorooney/obsidian-game-search-plugin/issues/34)
inject steam playtime_forever and playtime_2weeks into metadata

## 0.2.8

Better attempt to fix bug [32](https://github.com/CMorooney/obsidian-game-search-plugin/issues/32)
when trying to match steam games with RAWG API,
mark query as precise and exclude itch.io specifically

## 0.2.7

Better attempt to fix bug [32](https://github.com/CMorooney/obsidian-game-search-plugin/issues/32)
when trying to match steam games with RAWG API, provide Steam as storeId

## 0.2.6

Attempt to fix bug [32](https://github.com/CMorooney/obsidian-game-search-plugin/issues/32)
when trying to match steam games with RAWG API, flag the query as `search_exact`
to try and increase chances of the correct match.

## 0.2.5

Attempt to fix bug [29](https://github.com/CMorooney/obsidian-game-search-plugin/issues/29)

## 0.2.4

Fixes bug where regenerating metadata for game files would incorrectly format a string
that included a colon.

## 0.2.3

Fixes bug where re-generating metadata for game files would
skip executing any inline templater scripts.
[discussion](https://github.com/CMorooney/obsidian-game-search-plugin/discussions/24)

## 0.2.2

Re-initializes settings on API key entry to fix 401 bugs

## 0.2.1

Fixes bugs adding game note when passing undefined params in `createNote`
(addresses bug [20](https://github.com/CMorooney/obsidian-game-search-plugin/issues/20))

## 0.2.0

Adds Steam sync!
Changes how note regeneration works -- instead of completely regenerating the note
only regen and replace the metadata. Carries over steam related metadata if applicable

this is a rather large set of changes..
probably best to look at the README changes at commit `5222179a5758922c3e60060d0dc1d6646b724199`

## 0.1.8

Fixes issue with game titles that include
the pipe character or a question mark.
([Issue 15](https://github.com/CMorooney/obsidian-game-search-plugin/issues/15))

## 0.1.7

Fixes issue with Tags variable serialization
([Issue 13](https://github.com/CMorooney/obsidian-game-search-plugin/issues/13))

## 0.1.6

Fixes broken icon for ribbon button ([Issue 8](https://github.com/CMorooney/obsidian-game-search-plugin/issues/8))

## 0.1.5

Adds a button in the settings page to
completely regenerate all files in the selected folder.
This was mostly done so that folks who were not adding
anything to their templates could update their template and regenerate their library
([Issue 6](https://github.com/CMorooney/obsidian-game-search-plugin/issues/6))

## 0.1.4

Adds request to Game details endpoint of
RAWG api before creating game not or inserting
metadata into existing. This was mostly done so
that game Publishers and Developers could be
used in templating.
([Issue 3](https://github.com/CMorooney/obsidian-game-search-plugin/issues/3))

## 0.1.3

Puts `editorCallback` back when inserting
game metadata into existing note --
_that_ makes sense I just wasn't using
that feature as much/ever.

## 0.1.2

Removes `editorCallback` for action
in prefence of `callback` --
I would like to be able to create a game note
without being in edit mode.

## 0.1.1

Fixes install problem described in 0.1.0

## 0.1.0

Initial release to Obsidian package collection -
this version was broken because of a name mismatch
between the registered plugin and the actual manifest
after making a change to the registration during PR
but not the actual plugin.
