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

Type: `string`
