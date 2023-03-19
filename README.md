# Work Time Tracker

[Install from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=S-Mitterlehner.time-tracker-vscode)

![Work Time Tracker demo gif](./docs/media/intro.gif)

A Visual Studio Code extension for tracking your work time.
This extension allows you to track your worktime time, and stores the data in a JSON file in the `.vscode` directory of your workspace. Therefore no external tool is required for your worktime tracking.

## Features

- Track your worktime in a project
- Calculate spent time
- Multiple Projects in a single workspace
- Full control of your worktime-data

## Usage

### Time tracking

To track your time you must be inside a folder or workspace. Then you can start the tracking by entering the command `Time-Tracker: Start Tracking Work Time`. If the tracking has started you should have gotten a `times.json` file in your `.vscode` folder.
To stop the time-tracking you must activate the command `Time-Tracker: Stop Tracking Work Time`. After that you can insert a comment and hit `Enter`. Your time is saved.

To show your spent time, you have to activate the command `Time-Tracker: Total Time Spent`. A Popup with the information should show up.

### Multiple Projects

By default multiple projects are disabled, to keep it simple for most use-cases. However if you want to split your times by projects inside a single folder, change the `allowMultipleProjects` to `true` in your `times.json`.
NOTE: This is only possible with version `2+` (for more information see below).

After you changed the `times.json`, you have to reload the file by activating the command `Time-Tracker: Init` or reopening VS-Code.

Once you activated Multiple Projects you can start a new tracking. If you do, you should be asked to insert a Project-Name.

## Credits

Work Time Tracker was created by [S-Mitterlehner](https://github.com/S-Mitterlehner).

## License

This extension is licensed under the [MIT License](LICENSE).
