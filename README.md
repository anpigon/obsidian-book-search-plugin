# Obsidian Game Search Plugin

## forked from
https://github.com/anpigon/obsidian-book-search-plugin/

## Description

Use to query game using :

- A game title

Use RAWG Game API to get the game information.

<br>

## How to install

Click the link to install the Game Search plugin: [Install Link](https://github.com/CMorooney/obsidian-game-search-plugin)

Or, Search in the Obsidian Community plugin. And install it.

## How to use

### 1. Click the ribbon icon, or excute the command "Create new game note".

### 2. Search for game by keywords.

### 3. Select the game from the search results.

### 4. Voila! A note has been created.

## How to use settings

### New file location

Set the folder location where the new file is created. Otherwise, a new file is created in the Obsidian Root folder.

### New file name

You can set the file name format. The default format is `{{name}} - {{published}}`.
You can use `{{DATE}}` or `{{DATE:YYYYMMDD}}` to set a unique file name.

### Template file

You can set the template file location. There is an example template at the bottom.

## Example template

Please also find a definition of the variables used in this template below (see: [Template variables definitions](#template-variables-definitions)).

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

```

## Template variables definitions

Please find here a definition of the possible variables to be used in your template. Simply write `{{name}}` in your template, and replace name by the desired book data, including:

| name               | description                                             |
| -------------------|---------------------------------------------------------|
| id                 | (number) RAWG database Id                               |
| slug               | (string) RAWG game slug                                 |
| name               | (string) Name of the game                               |
| released           | (string) Release date of the game                       |
| tba                | (boolean) unknown release date flag                     |
| background_image   | (string) background image url                           |
| rating             | ([Rating](#rating_object))                              |
| rating_top         | (number), highest rating                                |
| ratings            | (array) of [Ratings](#rating_object)                    |
| ratings_count      | (number) of ratings                                     |
| reviews_text_count | (string) number of text reviews                         |
| metacritic         | (number) metacritic score                               |
| playtime           | (number) estimated playtime in hours                    |
| updated            | (string) last updated date in RAWG database             |
| esrb_rating        | ([ESRB](#esrb_object)) ESRB rating                      |
| platforms          | (array) of [Platforms](#platform_object)                |
| stores             | (array) of [Stores](#store_object)                      |
| score              | (number)                                                |
| tags               | (array) of [Tags](#tag_object)                          |
| saturated_color    | (string) hex color (without `#`)                        |
| dominant_color     | (string) hex color (without `#`)                        |
| genres             | (array) of [Genres](#genre-object)                      |
| short_screenshots  | (array) of [ScreenShots](#screenshot-object)            |

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
