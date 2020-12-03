const test = require('ava');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const packager = require('electron-packager');

const SnapPackager = require('./snap-packager');

const makeOptions = {
	appName: 'Nimble Notes v3!',
	forgeConfig: {
		packagerConfig: {
			icon: './test/fixtures/icon'
		}
	},
	packageJSON: {
		version: '2.0.3',
		description: 'Simple note taking'
		// Name = name
		// Product name = productName
		// Description = description
	},
	targetArch: 'x64',
	dir: './test/fixtures/out/nimble-notes-v3-linux-x64', // '/Users/davidwinter/projects/nimblenote/out/nimblenote-linux-x64',
	makeDir: './test/artifacts/make', // '/Users/davidwinter/projects/nimblenote/out/make',
	targetPlatform: 'linux'
};

const makerOptions = {
	// Icon = icon: './build/icon.png',
	// Categories = categories: ['Utility']
};

const dependencies = {
	process,
	fs
};

test('packager setup without overrides', t => {
	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies
	});

	t.is(pkg.values.applicationName, 'Nimble Notes v3!');
	t.is(pkg.values.version, '2.0.3');
	t.is(pkg.values.executableName, 'nimble-notes-v3');
	t.is(pkg.values.icon, path.join(process.cwd(), 'test/fixtures/icon.png'));
	t.is(pkg.values.summary, 'Simple note taking');
	t.is(pkg.values.description, 'Simple note taking');
	t.deepEqual(pkg.values.categories, []);
});

test('generation of desktop file', t => {
	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies
	});

	t.is(pkg.generateDesktopFile(), `[Desktop Entry]
Name=Nimble Notes v3!
Exec=nimble-notes-v3
Icon=\${SNAP}/meta/gui/nimble-notes-v3.png
Type=Application
Encoding=UTF-8
`);
});

test('generation of snapcraft.yaml', t => {
	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies
	});

	const snapYaml = yaml.safeLoad(pkg.generateSnapcraftYAML());

	t.like(snapYaml, {
		name: 'nimble-notes-v3',
		version: '2.0.3',
		icon: './snap/gui/nimble-notes-v3.png',
		summary: 'Simple note taking',
		description: 'Simple note taking',
		apps: {
			'nimble-notes-v3': {
				command: 'nimble-notes-v3/nimble-notes-v3 --no-sandbox'
			}
		},
		parts: {
			'nimble-notes-v3': {
				source: './app',
				'override-build': 'cp -rv . $SNAPCRAFT_PART_INSTALL/nimble-notes-v3'
			}
		}
	});

	t.true(snapYaml.apps['SNAP-TEMPLATE'] === undefined);
	t.true(snapYaml.parts['SNAP-TEMPLATE'] === undefined);
});

test('creation of snapcraft files', t => {
	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies
	});

	const destDir = path.join(makeOptions.makeDir, 'snapcraft', 'snap');

	t.true(pkg.createSnapcraftFiles());

	t.true(fs.existsSync(destDir));

	t.is(fs.readFileSync(path.join(destDir, 'snapcraft.yaml'), 'utf8'),
		pkg.generateSnapcraftYAML());

	t.is(fs.readFileSync(path.join(destDir, 'gui', 'nimble-notes-v3.desktop'), 'utf8'),
		pkg.generateDesktopFile());

	t.true(fs.existsSync(path.join(destDir, 'gui', 'nimble-notes-v3.png')));
});

test('creation of snap package', async t => {
	await packager({
		dir: './test/fixtures/app',
		out: './test/fixtures/out',
		name: 'nimble-notes-v3',
		platform: 'linux'
	});

	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies
	});

	pkg.createSnapcraftFiles();

	const destDir = path.join(makeOptions.makeDir, 'snapcraft', 'app');

	t.true(fs.existsSync(destDir));

	pkg.createSnapPackage();

	t.true(fs.existsSync(path.join(
		makeOptions.makeDir, 'nimble-notes-v3_2.0.3_amd64.snap')));
});
