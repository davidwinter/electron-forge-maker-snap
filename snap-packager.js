const path = require('path');
const ini = require('ini');
const yaml = require('js-yaml');
const debug = require('debug')('electron-forge-maker-snap:snap-packager');

const SnapValues = require('./snap-values');

module.exports = class SnapPackager {
	constructor(options) {
		this.options = options;
		this.deps = options.dependencies;

		this.values = new SnapValues({
			makeOptions: this.options.makeOptions,
			makerOptions: this.options.makerOptions
		});

		debug(`SnapPackager constructed with: ${options}`);
	}

	generateDesktopFile() {
		const data = {
			Name: this.values.applicationName,
			Exec: this.values.executableName,
			Icon: `\${SNAP}/meta/gui/${this.values.executableName}.png`,
			Type: 'Application',
			Encoding: 'UTF-8'
		};

		return ini.encode(data, {section: 'Desktop Entry'});
	}

	generateSnapcraftYAML() {
		const doc = yaml.safeLoad(this.deps.fse.readFileSync(path.join(__dirname, './snapcraft.template.yaml'), 'utf8'));

		doc.name = this.values.executableName;
		doc.title = this.values.applicationName;
		doc.version = this.values.version;
		doc.icon = `./snap/gui/${this.values.executableName}.png`;
		doc.summary = this.values.summary;
		doc.description = this.values.description;

		if (this.values.license) {
			doc.license = this.values.license;
		}

		doc.apps[this.values.executableName] = doc.apps['SNAP-TEMPLATE'];
		delete doc.apps['SNAP-TEMPLATE'];
		doc.apps[this.values.executableName].command = `${this.values.executableName}/${this.values.executableName} --no-sandbox`;

		doc.parts.app['override-build'] = `cp -rv . $SNAPCRAFT_PART_INSTALL/${this.values.executableName}`;
		doc.parts.app['stage-packages'] = this.values.stagePackages;

		if (this.values.layout) {
			doc.layout = this.values.layout;
		}

		return yaml.safeDump(doc);
	}

	createSnapcraftFiles() {
		const destDir = path.join(this.options.makeOptions.makeDir, 'snapcraft', 'snap');

		if (this.deps.fse.existsSync(destDir)) {
			this.deps.fse.rmdirSync(destDir, {recursive: true});
		}

		this.deps.fse.mkdirSync(path.join(destDir, 'gui'), {recursive: true});

		const snapcraftYAML = this.generateSnapcraftYAML();
		const snapcraftYAMLPath = path.join(destDir, 'snapcraft.yaml');
		debug(`Generated snapcraft.yaml file contents:\n\n${snapcraftYAML}`);
		this.deps.fse.writeFileSync(snapcraftYAMLPath, snapcraftYAML, 'utf8');
		debug(`snapcraft.yaml file written to: ${snapcraftYAMLPath}`);

		const desktopFile = this.generateDesktopFile();
		const desktopFilePath = path.join(destDir, 'gui', `${this.values.executableName}.desktop`);
		debug(`Generated .desktop file contents:\n\n${desktopFile}`);
		this.deps.fse.writeFileSync(desktopFilePath, desktopFile, 'utf8');
		debug(`.desktop file written to: ${desktopFilePath}`);

		const iconFileDestination = path.join(destDir, 'gui', `${this.values.executableName}.png`);
		this.deps.fse.copyFileSync(this.values.icon, iconFileDestination);
		debug(`Icon file copied to: ${iconFileDestination}`);

		const appFiles = path.join(destDir, '..', 'app');
		this.deps.fse.copySync(this.options.makeOptions.dir, appFiles);
		debug(`App files copied to: ${appFiles}`);

		return true;
	}

	async createSnapPackage() {
		let result = null;

		const snapFile = `${this.values.executableName}-${this.values.version}.snap`;
		debug(`Snap file artifact name will be: ${snapFile}`);

		const pathToSnapFile = path.join(this.options.makeOptions.makeDir, 'snapcraft', snapFile);
		debug(`Snap file will be created at: ${pathToSnapFile}`);

		try {
			result = await new Promise((resolve, reject) => {
				const spawnSnapcraftInDirectory = path.join(this.options.makeOptions.makeDir, 'snapcraft');

				const snapcraft = this.deps.spawn('snapcraft', ['snap', '--output', snapFile], {
					cwd: spawnSnapcraftInDirectory
				});

				debug(`Snapcraft is now running with: snapcraft snap --output ${snapFile}`);
				debug(`Snapcraft has been spawned within the directory: ${spawnSnapcraftInDirectory}`);

				snapcraft.on('close', code => {
					debug(`Snapcraft has finished running, with a status code of: ${code}`);

					if (code === 0) {
						resolve(code);
						return;
					}

					reject(code);
				});

				snapcraft.on('error', error => {
					debug(`Snapcraft has encountered an error and is aborting: ${error}`);

					reject(error);
				});

				snapcraft.stdout.on('data', data => {
					debug(`Snapcraft stdout: ${data.toString()}`);
				});
			});
		} catch (error) {
			debug(`Snapcraft encountered the following error (stderr): ${error.stderr}`);

			throw new Error(error.stderr);
		}

		debug(`Snapcraft finished with status code: ${result}`);
		debug(`Snapcraft file generated to: ${pathToSnapFile}`);

		return pathToSnapFile;
	}
};
