const test = require('ava');

const SnapValues = require('./snap-values');

const makeOptions = {
	/**
	 * Derived from either (in order):
	 *
	 * - packagerConfig.name
	 * - packageJSON.productName
	 * - packageJSON.name
	 *
	 * This is the basis for the executable name used by electron-packager
	 * though it runs the name through a sanitiser for the platforms.
	 */
	appName: 'Nimble Notes v3!',
	forgeConfig: {
		packagerConfig: {
			icon: './test/fixtures/icon'
		}
	},
	packageJSON: {
		version: '2.0.3',
		description: 'Simple note taking',
		license: 'MIT'
	},
	targetArch: 'x64',
	targetPlatform: 'linux'
};

test('applicationName is derived from electron-forge appName', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.applicationName, 'Nimble Notes v3!');
});

test('applicationName is overridden', t => {
	const makerOptions = {
		applicationName: 'Nimble Notes!'
	};

	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.applicationName, makerOptions.applicationName);
});

test('applicationName will be marked as invalid if over 40 characters', t => {
	const makerOptions = {
		applicationName: 'This is my really cool application DOWNLOAD NOW'
	};

	const values = new SnapValues({makeOptions, makerOptions});

	t.throws(() => {
		console.log(values.applicationName);
	}, {message: `applicationName must be 40 characters or less: ${makerOptions.applicationName}`});
});

test('executableName derived from applicationName and auto-sanitised', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.executableName, 'nimble-notes-v3');
});

test('executableName can be overriden with make options', t => {
	const makerOptions = {
		executableName: 'nimblenote!'
	};

	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.executableName, 'nimblenote');
});

test('packagedExecutableName is calculated from electron-packager', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.packagedExecutableName, 'Nimble Notes v3!');
});

test('version will be derived from package.json', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.version, '2.0.3');
});

test('summary will be derived from package.json', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.summary, 'Simple note taking');
});

test('summary can be overridden with maker config', t => {
	const makerOptions = {
		summary: 'Even simpler note taking'
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.summary, makerOptions.summary);
});

test('summary will throw an error if longer than 78 characters', t => {
	const makerOptions = {
		summary: 'Even simpler note taking that keeps on giving and giving and making your life more productive than ever'
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.throws(() => {
		console.log(values.summary);
	}, {message: 'summary must be 78 characters or less'});
});

test('description will be derived from package.json', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.description, 'Simple note taking');
});

test('description can be overridden', t => {
	const makerOptions = {
		description: 'Here we go again'
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.description, makerOptions.description);
});

test('license is derived from package.json', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.license, 'MIT');
});

test('license can be overridden', t => {
	const makerOptions = {
		license: 'Proprietary'
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.license, makerOptions.license);
});

test('icon is derived from forge config', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.icon, `${process.cwd()}/test/fixtures/icon.png`);
});

test('icon can be overridden', t => {
	const makerOptions = {
		icon: './test.png'
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.icon, `${process.cwd()}/test.png`);
});

test('categories default to empty', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.deepEqual(values.categories, []);
});

test('categories can be set', t => {
	const makerOptions = {
		categories: ['Utility', 'Development']
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.deepEqual(values.categories, makerOptions.categories);
});

test('confinement defaults to strict', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.confinement, 'strict');
});

test('confinement can be overridden', t => {
	const makerOptions = {
		confinement: 'devmode'
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.confinement, makerOptions.confinement);
});

test('confinement must be valid value', t => {
	const makerOptions = {
		confinement: 'relaxed'
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.throws(() => {
		console.log(values.confinement);
	}, {message: 'confinement must be either `strict`, `devmode` or `classic`'});
});

test('stagePackages has defaults', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.is(values.stagePackages, SnapValues.defaultStagePackages);
});

test('stagePackages can be replaced', t => {
	const makerOptions = {
		stagePackages: ['testPackage1', 'testPackage2']
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.stagePackages, makerOptions.stagePackages);
});

test('stagePackages can be overridden and include defaults', t => {
	const makerOptions = {
		stagePackages: ['testPackage1', 'testPackage2', 'default']
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.deepEqual(values.stagePackages.sort(),
		SnapValues.defaultStagePackages.concat(
			makerOptions.stagePackages.filter(item => item !== 'default'))
			.sort());
});

test('plugs have defaults', t => {
	const values = new SnapValues({makeOptions, makerOptions: {}});

	t.true(Array.isArray(SnapValues.defaultPlugs));
	t.is(values.plugs, SnapValues.defaultPlugs);
});

test('plugs can be replaced', t => {
	const makerOptions = {
		plugs: ['x11', 'home']
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.plugs, makerOptions.plugs);
});

test('plugs can be overridden and include defaults', t => {
	const makerOptions = {
		plugs: ['desktop-legacy', 'media-hub', 'default']
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.deepEqual(values.plugs.sort(),
		SnapValues.defaultPlugs.concat(
			makerOptions.plugs.filter(item => item !== 'default'))
			.sort());
});

test('layout values can be added', t => {
	const makerOptions = {
		layout: {
			'/usr/lib/x86_64-linux-gnu/imlib2': {
				bind: '$SNAP/usr/lib/x86_64-linux-gnu/imlib2'
			}
		}
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.like(values.layout, makerOptions.layout);
});
