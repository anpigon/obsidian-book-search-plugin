# Obsidian Game Search Plugin

- [How to Install](#how-to-install)
- [Basic Usage](#basic-usage)
- [Steam Sync](#steam-sync)
- [Templating](#templating)
  - [Example Template](#example-template)
  - [Template Variable Definitions](#template-variables-definitions)
  - [Regenerating File Metadata](#regenerating-file-metadata)

## Forked From

https://github.com/anpigon/obsidian-book-search-plugin/

## Description

Use to query game using a game title (uses RAWG Game API to get the game information.)

## How to Install

Click the link to install the Game Search plugin: [Install Link](https://github.com/CMorooney/obsidian-game-search-plugin)
Or, search 'Game Search' in the Obsidian Community plugin directory and install it from there.

## Basic Usage

1. Acquire an API key from [RAWG](https://rawg.io/apidocs)
2. Enter your RAWG API key into the Game Search plugin settings
3. Select a location for your game notes to be created
4. Enter a file name format
5. Select a file to use as a note template
6. Use the command `Create New Game Note` to search for a game
7. Select a game from the search results
8. Your note has been created :]

## Steam Sync

Optionally, you can auto-sync your Steam Library and Wishlist.

1. Acquire an API key from [Steam](https://steamcommunity.com/dev)
2. Make note of your user SteamId (navigate to your profile on the web and check the URL)
3. Enter your Steam API key and Id into the Game Search plugin settings
4. Ensure your Steam Privacy Settings have your wishlist set to `Public` if you wish to sync wishlist items
5. (Optional) provide metadata to be injected into wishlisted and/or owned games
   - For example, I add `status: backlog` to wishlist games and `owned_platform: steam` to owned games
6. Use command `Sync Steam` to begin a sync.
   - This is not speedy, especially with larger libraries. There is a progress bar to provide some feedback but just...heads up
7. **NOTE**: Synced Steam games will automatically have a `steamId` metadata property added. Don't remove this.

## Templating

It is recommended to pair this plugin with [Templater](https://github.com/SilentVoid13/Templater)
so that you can auto-generate content for your game notes.

### Example Template

The following is an example template. A complete list of template variables provided by the plugin
 can be found under [Template Variable Definitions](#template-variables-definitions). 
 **Note**: Array properties will output as a comma separated string.

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

**Previous versions** of this plugin this button would _completely_ regenerate
the files, and you would lose any non-templated content in them.

**As of v0.2.0** this feature only replaces the metadata of your game files with
regenerated metadata from the template. The motivation behind this is that it
is likely that the body of a game note is used for keepsake/TODO lists/personal notes,
while the main portion of the templating will happen in the metadata. I'm open to
revisiting this if it proves to be a bad idea.

**Note**: `steamId`, `steamPlaytimeForever`, `steamPlaytime2Weeks`, and any user-provided metadata to be injected into
Steam games (added via settings) will be preserved.

## Other Settings

### New file location

Set the folder location where the new file is created. Otherwise, a new file is created in the Obsidian root folder.

### New file name

You can set the file name format. The default format is `{{name}} - {{published}}`.
You can use `{{DATE}}` or `{{DATE:YYYYMMDD}}` to set a unique file name.

If you are using the Steam integration portion of the plugin you can also
flip a toggle in settings to try and immediately match any created game notes
with a game in your Steam library to so that steam metadata gets immediately injected.
*THIS WILL ONLY MATCH GAMES IN YOUR LIBRARY ALREADY*

### Template variables definitions

The following table lists and describes each variable that can be used in your template. To use a 
variable in your template, simply write the variable name surrounded by curly braces (e.g., 
`{{name}}`).

| Name                 | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| id                   | (number) RAWG database ID                                     |
| slug                 | (string) RAWG game slug                                       |
| name                 | (string) Name of the game                                     |
| name_original        | (string) Original name of the game                            |
| description          | (string) Description of the game (HTML)                       |
| description_raw      | (string) Description of the game (Text)                       |
| released             | (string) Release date of the game                             |
| tba                  | (boolean) Unknown release date flag                           |
| background_image     | (string) Background image URL                                 |
| rating               | ([Rating](#rating_object))                                    |
| rating_top           | (number) Highest rating                                       |
| ratings              | (array) of [Ratings](#rating_object)                          |
| ratings_count        | (number) Number of ratings                                    |
| reviews_text_count   | (string) Number of text reviews                               |
| metacritic           | (number) Metacritic score                                     |
| metacritic_platforms | (array) of [MetacriticPlatform](#metacritic_platform_object)) |
| playtime             | (number) Estimated playtime in hours                          |
| updated              | (string) Last updated date in RAWG database                   |
| esrb_rating          | ([ESRB](#esrb_object)) ESRB rating                            |
| platforms            | (array) of [Platforms](#platform_object)                      |
| stores               | (array) of [Stores](#store_object)                            |
| score                | (number)                                                      |
| tags                 | (array) of [Tags](#tag_object)                                |
| saturated_color      | (string) Color in hexadecimal format (without `#`)            |
| dominant_color       | (string) Color in hexadecimal format (without `#`)            |
| genres               | (array) of [Genres](#genre-object)                            |
| short_screenshots    | (array) of [ScreenShots](#screenshot-object)                  |
| website              | (string) URL of game website, if one exists                   |
| publishers           | (array) of [Publishers](#publisher-object)                    |
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
