# electron-forge-maker-snap

> Simple snap packaging that works

## Usage

Within your forge config, add:

```js
makers: [
	...
	, {
		name: 'electron-forge-maker-snap',
		config: {
			icon: './build/icon.png',
			categories: ['Utility']
		}
	},
	...
]
```

## Configuration

The maker will try and figure out a bunch of sensible defaults for your config, but these can be overridden with the following:

### icon

Type: `string`

Default to either:

- Value from `packagerConfig.icon` of your `electron-forge` config
-

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

### icon

**Type:** `string`\
**Default:** Derived from `icon` within your `electron-forge` `packagerConfig`, appending a `.png` extension if required.

The application icon used within the Snap Store and also with the Linux distribution desktop integration via the `.desktop` file - what appears in menus and docks.

### categories

**Type:** `array` of `string`\
**Default:** `[]`

See: https://specifications.freedesktop.org/menu-spec/latest/apa.html#main-category-registry
