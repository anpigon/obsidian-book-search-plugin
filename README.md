# Obsidian Game Search Plugin

- [How to install](#how-to-install)
- [Basic Usage](#basic-usage)
- [Steam Sync](#steam-sync)
- [Templating](#templating)
  - [Example Template](#example-template)
  - [Template variables definitions](#template-variables-definitions)
  - [Regenerating files from new template](#regenerating-file-metadata)

## forked from

https://github.com/anpigon/obsidian-book-search-plugin/

## Description

Use to query game using a game title (uses RAWG Game API to get the game information.)

**PLEASE NOTE THAT CREATING AN API KEY ON RAWG SEEMS TO TAKE SOME TIME TO ACTIVATE**
**TRYING TO USE A KEY IMMEDIATELY AFTER CREATING IT SEEMS TO OFTEN RESULT IN 401 ERRORS**.

### BEFORE OPENING AN ISSUE REGARDING RAWG KEYS AND 401 ERRORS PLEASE ENSURE YOU HAVE WAITED SOME AND TRIED AGAIN

**(see initial issue [here](https://github.com/CMorooney/obsidian-game-search-plugin/issues/11))**

## How to install

Click the link to install the Game Search plugin: [Install Link](https://github.com/CMorooney/obsidian-game-search-plugin)
Or, search 'Game Search' in the Obsidian Community plugin directory and install it from there.

## Basic Usage

1. Acquire an API key from [RAWG](https://rawg.io/apidocs)
2. Enter your RAWG API key into the Game Search Plugin Settings
3. Use command `Create New Game Note` to search for a game
4. After searching, you will be presented with results -- select one!
5. Your not has been created :]

## Steam Sync

Optionally, you can auto-sync your Steam Library and Wishlist.

1. Acquire an API key from [Steam](https://steamcommunity.com/dev)
2. Make note of your user SteamId (navigate to your profile on the web and check the url)
3. Enter your Steam API key and Id into Game Search Plugin Settings
4. Ensure your Steam Privacy Settings have your wishlist set to `Public` if you wish to sync wishlist
5. (Optional) provide metadata to be injected into wishlisted and/or owned games
   a. for example, I add `status: backlog` to wishlist games and `owned_platform: steam` to owned games
6. Use command `Sync Steam` to begin a sync.
   a. this is not speedy, especially with larger libraries. There is a progress bar to provide some feedback but just...heads up
7. **NOTE:** synced Steam games will automatically have a `steamId` metadata property added. don't remove this.

## Templating

It is recommended to pair this plugin with [Templater](https://github.com/SilentVoid13/Templater)
so that you can auto-generate content for your game notes.

### Example template

Please also find a definition of the variables used in this template below (see: [Template variables definitions](#template-variables-definitions)).
note: array properties will currently output as a comma separated string

```
---
tag: Game 🎮
genres: {{genres}}
platforms: {{platforms}}
release_date: {{released}}
background_image: {{background_image}}
---

![{{name}}]({{background_image}})

Genres: {{genres}}
Release Date: {{released}}
Publishers: {{publishers}}
Developers: {{developers}}
```

## Regenerating File Metadata

Acknowledging that you may adjust your template after adding many many games,
the plugin provides a button **within the settings panel** to regenerate all of
your game note metadata.

**In previous versions** of this plugin this button would _completely_ regenerate
the files and you would lose any non-templated content in them.

**As of v0.2.0** this feature only replaces the metadata of your game files with
regenerated metadata from the templates. The motiviation behind this is that it
is likely that the body of a game note is used for keepsake/TODO lists/personal notes
while the main portion of the templating will happen in the metadata. I'm open to
revisiting this if it proves to be a bad idea.

**note:** `steamId` and any user-provided metadata to be injected into
steam games (added via settings) will be preserved

## Other Settings

### New file location

Set the folder location where the new file is created. Otherwise, a new file is created in the Obsidian Root folder.

### New file name

You can set the file name format. The default format is `{{name}} - {{published}}`.
You can use `{{DATE}}` or `{{DATE:YYYYMMDD}}` to set a unique file name.

### Template variables definitions

Please find here a definition of the possible variables to be used in your template. Simply write `{{name}}` in your template, and replace name by the desired game data, including:

| name                 | description                                                   |
| -------------------- | ------------------------------------------------------------- |
| id                   | (number) RAWG database Id                                     |
| slug                 | (string) RAWG game slug                                       |
| name                 | (string) Name of the game                                     |
| name_original        | (string) Original name of the game                            |
| description          | (string) Description of the game, html format                 |
| description_raw      | (string) Description of the game, raw text                    |
| released             | (string) Release date of the game                             |
| tba                  | (boolean) unknown release date flag                           |
| background_image     | (string) background image url                                 |
| rating               | ([Rating](#rating_object))                                    |
| rating_top           | (number), highest rating                                      |
| ratings              | (array) of [Ratings](#rating_object)                          |
| ratings_count        | (number) of ratings                                           |
| reviews_text_count   | (string) number of text reviews                               |
| metacritic           | (number) metacritic score                                     |
| metacritic_platforms | (array) of [MetacriticPlatform](#metacritic_platform_object)) |
| playtime             | (number) estimated playtime in hours                          |
| updated              | (string) last updated date in RAWG database                   |
| esrb_rating          | ([ESRB](#esrb_object)) ESRB rating                            |
| platforms            | (array) of [Platforms](#platform_object)                      |
| stores               | (array) of [Stores](#store_object)                            |
| score                | (number)                                                      |
| tags                 | (array) of [Tags](#tag_object)                                |
| saturated_color      | (string) hex color (without `#`)                              |
| dominant_color       | (string) hex color (without `#`)                              |
| genres               | (array) of [Genres](#genre-object)                            |
| short_screenshots    | (array) of [ScreenShots](#screenshot-object)                  |
| website              | (string) url of game website if one exists                    |
| publihers            | (array) of [Publishers](#publisher-object)                    |
| developers           | (array) of [Developers](#developer-object)                    |

### Developer Object

`{ id: number, name: string, slug: string, games_count: number, image_background: string }`

### Publisher Object

`{ id: number, name: string, slug: string, games_count: number, image_background: string }`

### Metacritic Platform Object

`{ metscore: number, url: string, platform: [Platform](#platform_object) }`

### Rating Object

`{ id: number, title: string, count: number, percent: number }`

### ESRB Object

`{ id: number, name: string, slug: string, name_en: string, name_ru: string }`

### Platform Object

`{ platform: { id: number, name: string, slug: string } }`

### Store Object

`{ id: number, name: string, slug: string }`

### Tag Object

`{ id: number, name: string, slug: string, language: string, games_count: number, image_background: string }`

### Genre Object

`{ id: number, name: string, slug: string }`

### ScreenShot Object

`{ id: number, name: string, slug: string }`
