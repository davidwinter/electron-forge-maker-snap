const test = require('ava');
const yaml = require('js-yaml');
const fse = require('fs-extra');
const {spawn} = require('child_process');
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
		description: 'Simple note taking',
		license: 'MIT'
		// Name = name
		// Product name = productName
		// Description = description
	},
	targetArch: 'x64',
	dir: './test/artifacts/out/Nimble Notes v3!-linux-x64', // '/Users/davidwinter/projects/nimblenote/out/nimblenote-linux-x64',
	makeDir: './test/artifacts/make', // '/Users/davidwinter/projects/nimblenote/out/make',
	targetPlatform: 'linux'
};

const makerOptions = {
	stagePackages: ['default', 'libpcre3'],
	layout: {
		'/usr/lib/x86_64-linux-gnu/imlib2': {
			bind: '$SNAP/meta/gui/nimble-notes-v3.png'
		}
	}
	// Icon = icon: './build/icon.png',
	// Categories = categories: ['Utility']
};

const dependencies = {
	process,
	fse,
	spawn
};

test.beforeEach(() => {
	fse.rmdirSync('./test/artifacts', {recursive: true});
});

test.afterEach(() => {
	fse.rmdirSync('./test/artifacts', {recursive: true});
});

test('packager setup without overrides', t => {
	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies
	});

	t.is(pkg.values.applicationName, 'Nimble Notes v3!');
	t.is(pkg.values.version, '2.0.3');
	t.is(pkg.values.executableName, 'nimble-notes-v3');
	t.is(pkg.values.packagedExecutableName, 'Nimble Notes v3!');
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
		title: 'Nimble Notes v3!',
		version: '2.0.3',
		icon: './snap/gui/nimble-notes-v3.png',
		summary: 'Simple note taking',
		description: 'Simple note taking',
		license: 'MIT',
		apps: {
			'nimble-notes-v3': {
				command: 'nimble-notes-v3/nimble-notes-v3 --no-sandbox'
			}
		},
		parts: {
			app: {
				source: './app',
				'override-build': 'cp -rv . $SNAPCRAFT_PART_INSTALL/nimble-notes-v3',
				'stage-packages': [
					'libpcre3',
					'libnss3',
					'libnspr4'
				]
			}
		},
		layout: {
			'/usr/lib/x86_64-linux-gnu/imlib2': {
				bind: '$SNAP/meta/gui/nimble-notes-v3.png'
			}
		}
	});

	t.true(snapYaml.apps['SNAP-TEMPLATE'] === undefined);
});

if (!process.env.FAST_TESTS) {
	test.serial('creation of snap package', async t => {
		await packager({
			dir: './test/fixtures/app',
			out: './test/artifacts/out',
			name: 'Nimble Notes v3!',
			platform: 'linux',
			overwrite: true,
			quiet: true
		});

		const pkg = new SnapPackager({
			makeOptions,
			makerOptions,
			dependencies
		});

		pkg.createSnapcraftFiles();

		const destDir = path.join(makeOptions.makeDir, 'snapcraft');

		t.is(fse.readFileSync(path.join(destDir, 'snap', 'snapcraft.yaml'), 'utf8'),
			pkg.generateSnapcraftYAML());

		t.is(fse.readFileSync(path.join(destDir, 'snap', 'gui', 'nimble-notes-v3.desktop'), 'utf8'),
			pkg.generateDesktopFile());

		t.true(fse.existsSync(path.join(destDir, 'snap', 'gui', 'nimble-notes-v3.png')));

		t.true(fse.existsSync(path.join(destDir, 'app')));

		const snapfilePath = await pkg.createSnapPackage();

		t.is(snapfilePath, path.join(
			makeOptions.makeDir, 'snapcraft', 'nimble-notes-v3-2.0.3.snap'));

		t.true(fse.existsSync(snapfilePath));
	});
}
