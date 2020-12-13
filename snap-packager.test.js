const test = require('ava');
const sinon = require('sinon');

const {spawn} = require('child_process');
const path = require('path');
const EventEmitter = require('events');

const yaml = require('js-yaml');
const fse = require('fs-extra');
const packager = require('electron-packager');

const SnapPackager = require('./snap-packager');
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
	},
	targetArch: 'x64',
	dir: './test/artifacts/out/Nimble Notes v3!-linux-x64',
	makeDir: './test/artifacts/make',
	targetPlatform: 'linux'
};

const makerOptions = {
	confinement: 'strict',
	grade: 'stable',
	stagePackages: ['default', 'scrot'],
	plugs: ['media-hub', 'default'],
	layout: {
		'/usr/lib/x86_64-linux-gnu/imlib2': {
			bind: '$SNAP/meta/gui/nimble-notes-v3.png'
		}
	}
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
		confinement: 'strict',
		grade: 'stable',
		apps: {
			'nimble-notes-v3': {
				command: 'nimble-notes-v3/nimble-notes-v3 --no-sandbox',
				plugs: makerOptions.plugs.filter(item => item !== 'default').concat(
					SnapValues.defaultPlugs
				)
			}
		},
		parts: {
			app: {
				source: './app',
				'override-build': 'cp -rv . $SNAPCRAFT_PART_INSTALL/nimble-notes-v3',
				'stage-packages': makerOptions.stagePackages.filter(item => item !== 'default').concat(
					SnapValues.defaultStagePackages
				)
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

test('creation of snap files will remove destination path if it exists', t => {
	const fseStub = sinon.stub(fse);

	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies: {
			...dependencies,
			fse: fseStub
		}
	});

	fseStub.existsSync.returns(true);
	fseStub.readFileSync.callThrough();

	pkg.createSnapcraftFiles();

	t.true(fseStub.rmdirSync.calledOnce);
});

test('will throw error if snapcraft finishes with non-zero exit code', t => {
	class SpawnEmitter extends EventEmitter {}
	const spawnEmitter = new SpawnEmitter();
	spawnEmitter.stdout = new SpawnEmitter();

	const spawnStub = sinon.stub().returns(spawnEmitter);

	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies: {
			spawn: spawnStub
		}
	});

	const snapPromise = pkg.createSnapPackage().catch(error => {
		t.is(error.message, 'Snapcraft exited with a non-zero status code of: 120');
	});

	spawnEmitter.emit('close', 120);

	return snapPromise;
});

test('will throw error if snapcraft process errors', t => {
	class SpawnEmitter extends EventEmitter {}
	const spawnEmitter = new SpawnEmitter();
	spawnEmitter.stdout = new SpawnEmitter();

	const spawnStub = sinon.stub().returns(spawnEmitter);

	const pkg = new SnapPackager({
		makeOptions,
		makerOptions,
		dependencies: {
			spawn: spawnStub
		}
	});

	const snapPromise = pkg.createSnapPackage().catch(error => {
		t.is(error.message, 'Snapcraft process error');
	});

	spawnEmitter.emit('error', new Error('Snapcraft process error'));

	return snapPromise;
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
