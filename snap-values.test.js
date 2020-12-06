const test = require('ava');

const SnapValues = require('./snap-values');

const makeOptions = {
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
		// Name = name
		// Product name = productName
		// Description = description
	},
	targetArch: 'x64',
	targetPlatform: 'linux'
};

test('applicationName is derived from electron-forge appName', t => {
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.applicationName, 'Nimble Notes v3!');
});

test('applicationName is overridden', t => {
	const makerOptions = {
		applicationName: 'Nimble Notes!'
	};

	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.applicationName, 'Nimble Notes!');
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

test('executableName will be derived from applicationName and auto-sanitised', t => {
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.executableName, 'nimble-notes-v3');
});

test('executableName can be overriden with make options', t => {
	const makerOptions = {
		executableName: 'nimblenote!'
	};

	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.executableName, 'nimblenote');
});

test('version will be derived from package.json', t => {
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

	t.is(values.version, '2.0.3');
});

test('summary will be derived from package.json', t => {
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

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
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

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
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

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
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

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
	const makerOptions = {};
	const values = new SnapValues({makeOptions, makerOptions});

	t.deepEqual(values.categories, []);
});

test('categories can be set', t => {
	const makerOptions = {
		categories: ['Utility', 'Development']
	};
	const values = new SnapValues({makeOptions, makerOptions});

	t.deepEqual(values.categories, makerOptions.categories);
});
