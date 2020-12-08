const path = require('path');
const ini = require('ini');
const yaml = require('js-yaml');
const debug = require('debug')('snap-packager');

const SnapValues = require('./snap-values');

module.exports = class SnapCommand {
	constructor(options) {
		this.options = options;
		this.deps = options.dependencies;

		this.values = new SnapValues({
			makeOptions: this.options.makeOptions,
			makerOptions: this.options.makerOptions
		});
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

		this.deps.fse.writeFileSync(
			path.join(destDir, 'snapcraft.yaml'),
			this.generateSnapcraftYAML(),
			'utf8');

		this.deps.fse.writeFileSync(
			path.join(destDir, 'gui', `${this.values.executableName}.desktop`),
			this.generateDesktopFile(),
			'utf8');

		this.deps.fse.copyFileSync(
			this.values.icon,
			path.join(destDir, 'gui', `${this.values.executableName}.png`));

		this.deps.fse.copySync(
			this.options.makeOptions.dir,
			path.join(destDir, '..', 'app'));

		return true;
	}

	async createSnapPackage() {
		let result = null;

		try {
			result = await new Promise((resolve, reject) => {
				const snapcraft = this.deps.spawn('snapcraft', [], {
					cwd: path.join(this.options.makeOptions.makeDir, 'snapcraft')
				});

				snapcraft.on('close', code => {
					if (code === 0) {
						resolve(code);
						return;
					}

					reject(code);
				});

				snapcraft.on('error', error => {
					reject(error);
				});

				snapcraft.stdout.on('data', data => {
					debug(data.toString());
				});
			});
		} catch (error) {
			throw new Error(error);
		}

		debug(`snapcraft finished with status code: ${result}`);

		return result === 0;
	}
};
