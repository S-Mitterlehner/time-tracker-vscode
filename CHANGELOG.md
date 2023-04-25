# Change Log

<!--
    All notable changes to the "time-tracker" extension will be documented in this file.
    Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.
-->

## [1.0.1]

- Bugfix `askForProductivityFactor` was not applied from the user-settings

## [1.0.0]

- Restructuring
- Logo
- Move settings into VsCode-Settings
  - allowMultipleProject
  - askForProductivityFactor
  - defaultProductivityFactor
- change Storage -> [V3](../storage/v3.md)
  - `times` -> rename to `projects`
  - projects can have additional settings (like `defaultProductivityFactor`)
  - defaultProject -> project that will be used, when empty insert
    - set via settings
    - set via commands

## [0.1.2]

- `allowMultipleProjects` via command
- `productivityFactor`
- bugfixes

## [0.1.1]

- StatusBar Button
- `times.json`-Migrations

## [0.1.0]

- Initial Release
