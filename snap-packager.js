const path = require('path');
const ini = require('ini');
const yaml = require('js-yaml');
const fse = require('fs-extra');
const {spawnSync} = require('child_process');

module.exports = class SnapCommand {
	constructor(options) {
		this.options = options;
		this.deps = options.dependencies;

		this.values = {
			applicationName: options.makeOptions.appName,
			version: options.makeOptions.packageJSON.version,
			executableName: this._sanatizeExecutableName(options.makeOptions.appName),
			icon: this._getIconPath(),
			summary: options.makeOptions.packageJSON.description,
			description: options.makeOptions.packageJSON.description,
			categories: this._getCategories()
		};
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
		const doc = yaml.safeLoad(this.deps.fs.readFileSync(path.join(__dirname, './snapcraft.template.yaml'), 'utf8'));

		doc.name = this.values.executableName;
		doc.version = this.values.version;
		doc.icon = `./snap/gui/${this.values.executableName}.png`;
		doc.summary = this.values.summary;
		doc.description = this.values.description;

		doc.apps[this.values.executableName] = doc.apps['SNAP-TEMPLATE'];
		delete doc.apps['SNAP-TEMPLATE'];
		doc.apps[this.values.executableName].command = `${this.values.executableName}/${this.values.executableName} --no-sandbox`;

		doc.parts[this.values.executableName] = doc.parts['SNAP-TEMPLATE'];
		delete doc.parts['SNAP-TEMPLATE'];
		doc.parts[this.values.executableName]['override-build'] = `cp -rv . $SNAPCRAFT_PART_INSTALL/${this.values.executableName}`;

		return yaml.safeDump(doc);
	}

	createSnapcraftFiles() {
		const destDir = path.join(this.options.makeOptions.makeDir, 'snapcraft', 'snap');

		if (this.deps.fs.existsSync(destDir)) {
			this.deps.fs.rmdirSync(destDir, {recursive: true});
		}

		this.deps.fs.mkdirSync(path.join(destDir, 'gui'), {recursive: true});

		this.deps.fs.writeFileSync(
			path.join(destDir, 'snapcraft.yaml'),
			this.generateSnapcraftYAML(),
			'utf8');

		this.deps.fs.writeFileSync(
			path.join(destDir, 'gui', `${this.values.executableName}.desktop`),
			this.generateDesktopFile(),
			'utf8');

		this.deps.fs.copyFileSync(
			this.values.icon,
			path.join(destDir, 'gui', `${this.values.executableName}.png`));

		fse.copySync(
			this.options.makeOptions.dir,
			path.join(destDir, '..', 'app'));

		return true;
	}

	createSnapPackage() {
		/**
		 * Due to a [bug](https://bugs.launchpad.net/snapcraft/+bug/1906660) with snapcraft
		 * need to disable stdio from the snapcraft call, as without TTY, throws a 120 status
		 *
		 * Ideally, when this bug is resolved, be good to capture any stderr output and
		 * display to the user if there is a failure.
		 */
		const result = spawnSync('snapcraft', [], {
			cwd: path.join(this.options.makeOptions.makeDir, 'snapcraft'),
			stdio: 'ignore'
		});

		if (result.status !== 0) {
			throw new Error(result);
		}
	}

	_sanatizeExecutableName(name) {
		const execName = name.toLowerCase().replace(/ /g, '-');
		return execName.replace(/[^a-z\d\\-]/g, '');
	}

	_getIconPath() {
		return path.join(
			this.deps.process.cwd(),
			`${this.options.makeOptions.forgeConfig.packagerConfig.icon}.png`);
	}

	_getCategories() {
		return [];
	}
};
