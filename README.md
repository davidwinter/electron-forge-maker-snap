# @davidwinter/electron-forge-maker-snap

[![test](https://github.com/davidwinter/electron-forge-maker-snap/workflows/test/badge.svg)](https://github.com/davidwinter/electron-forge-maker-snap/actions?query=workflow%3Atest) [![Codecov](https://img.shields.io/codecov/c/github/davidwinter/electron-forge-maker-snap)](https://codecov.io/gh/davidwinter/electron-forge-maker-snap) [![npm (scoped)](https://img.shields.io/npm/v/@davidwinter/electron-forge-maker-snap)](https://www.npmjs.com/package/@davidwinter/electron-forge-maker-snap) [![npm](https://img.shields.io/npm/dw/@davidwinter/electron-forge-maker-snap)](https://www.npmjs.com/package/@davidwinter/electron-forge-maker-snap)

> Simple snap packaging for `electron-forge` that just works

## Prerequisites

- Ensure that `snapcraft` is [installed](https://snapcraft.io/docs/installing-snapcraft) via `snap` (the `.deb` version of `snap` is now deprecated)

## Installation

```sh
yarn add @davidwinter/electron-forge-maker-snap --dev
```

or

```sh
npm install @davidwinter/electron-forge-maker-snap --dev
```

## Usage

You can read more about [Makers config on the electron-forge website](https://www.electronforge.io/config/makers), but essentially the config required is:

```js
{
	name: '@davidwinter/electron-forge-maker-snap',
	config: {
		categories: ['Utility']
		// See below for more configuration options
	}
}
```

Then make your snap package:

```
electron-forge make --target="@davidwinter/electron-forge-maker-snap"
```

Once completed, the snap package will be located at: `out/make` with a filename like `{executable}-{version}.snap`, for example, `out/make/nimblenote-2.0.3.snap`.

### Using with CI

When using this maker with CI, such as GitHub Actions, CircleCI etc, it is best practice to tell `snapcraft` to build snaps in the `host` build environment. To do this, set the environment variable `SNAP_BUILD_ENVIRONMENT=host`.

An example that works with GitHub Actions:

```yml
- name: Install snapcraft
  run: sudo snap install snapcraft --classic

- name: Build snap package
  run: yarn make
  env:
    SNAPCRAFT_BUILD_ENVIRONMENT: host

- name: Upload snap artifact
  uses: actions/upload-artifact@v2
  with:
    path: out/make/*.snap
```

### Debugging

Run with `DEBUG='electron-forge-maker-snap:*,electron-forge:lifecycle'` for debug output from `snapcraft`:

```sh
DEBUG='electron-forge-maker-snap:*,electron-forge:lifecycle' electron-forge make --target="@davidwinter/electron-forge-maker-snap"
```

Appending the `,electron-forge:lifecycle` debug namespace above is required in order to see this makers debug output. Otherwise by default, during the `electron-forge` output, any other `debug` messages are suppressed so that it doesn't interfere with the CLI interface. Adding this additional namespace acts as a flag to enable the debug output in a safe way.

## Configuration

The maker will try and figure out a bunch of sensible defaults for your config, but the following values can be overridden.

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

### confinement

**Type:** `string`\
**Default:** `strict`

The snap confinement can be either `strict`, `devmode` or `classic`.

### grade

**Type:** `string`\
**Default:** `stable`

The snap grade can be either `stable` or `devel`.

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
**Default:** `['libnss3', 'libnspr4', 'libasound2', 'libgconf2-4', 'libnotify4', 'libpcre3', 'libpulse0', 'libxss1', 'libxtst6']`

List of additional packages required to support creationg of the app. If you want to add packages in addition to the default, add an item named `default`, for example: `['default', 'libxfixes3']`.

### plugs

**Type:** `array` of `string`\
**Default:** `['alsa', 'browser-support', 'desktop', 'desktop-legacy', 'gsettings', 'home', 'network', 'opengl', 'pulseaudio', 'unity7', 'x11']`

List of additional plugs to include in the snap. If you want to add plugs in addition to the default, add an item named `default`, for example: `['default', 'media-hub']` to add the `media-hub` plug in addition to all of the defaults.

### layout

**Type:** `object`

See [Snap layouts](https://snapcraft.io/docs/snap-layouts). Define in the same format described on that page.
