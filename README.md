# @davidwinter/electron-forge-maker-snap [![test](https://github.com/davidwinter/electron-forge-maker-snap/workflows/test/badge.svg)](https://github.com/davidwinter/electron-forge-maker-snap/actions?query=workflow%3Atest)

> Simple snap packaging for `electron-forge` that just works

## Prerequisites

- `snapcraft` [installed](https://snapcraft.io/docs/installing-snapcraft)

## Installation

```
npm install @davidwinter/electron-forge-maker-snap --dev
```

or

```
yarn install @davidwinter/electron-forge-maker-snap --dev
```

## Usage

Within your `electron-forge` config, add:

```js
makers: [
	...
	, {
		name: '@davidwinter/electron-forge-maker-snap'
	},
	...
]
```

Then make your snap package:

```
electron-forge make --target="@davidwinter/electron-forge-maker-snap"
```

## Configuration

The maker will try and figure out a bunch of sensible defaults for your config, but these can be overridden with the following:

### applicationName

**Type:** `string`\
**Default:** From the derived `appName` value from the `electron-forge` configuration.

Maximum length of 40 characters.

This is the human friendly name of the application, also the `title` that will be used for the Snapstore and `.desktop` integration with Linux distributions.

**Example:** `Acme Notes 3`

### executableName

**Type:** `string`\
**Default:** A sanatised version of `applicationName` with invalid characters removed and spaces replaced with dashes.

Can only contain letters in lower case, numbers, and hyphens, and it can’t start or end with a hyphen. Automatic sanitation will be applied.

**Example:** `acme-notes-3`

### summary

**Type:** `string`\
**Default:** Derived from `description` within `package.json`.

Maximum length of 78 characters.

This is used by the Snap Store as the application summary and is mandatory.

**Example:** `Write your best notes with Acme Notes v3!`

### description

**Type:** `string`\
**Default:** Derived from `description` within `package.json`.

This can be a multi-line description of the application and is used by the Snap Store.

### license

**Type:** `string`\
**Default:** Derived from `license` within `package.json`.

A license for the snap in the form of an SPDX expression for the license.

**Example:** `MIT`

### icon

**Type:** `string`\
**Default:** Derived from `icon` within your `electron-forge` `packagerConfig`, appending a `.png` extension if required.

The application icon used within the Snap Store and also with the Linux distribution desktop integration via the `.desktop` file - what appears in menus and docks.

**Example:** `./build/icon.png`

### categories

**Type:** `array` of `string`\
**Default:** `[]`

These categories define which menus the application belongs to on a Linux distribution. See: https://specifications.freedesktop.org/menu-spec/latest/apa.html#main-category-registry

**Example:** `['Utility', 'Development']`

### stagePackages

**Type:** `array` of `string`\
**Default:** `['libnss3', 'libnspr4']`

List of additional packages required to support creationg of the app. If you want to add packages in addition to the default, add an item named `default`, for example: `['default', 'libxfixes3']`.
