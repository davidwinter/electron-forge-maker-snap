const path = require('path');
const LinuxApp = require('electron-packager/src/linux').App;

class SnapValues {
	constructor(options) {
		this.makeOptions = options.makeOptions;
		this.makerOptions = options.makerOptions;

		this.values = {};
	}

	get applicationName() {
		this.values.applicationName = this.makerOptions.applicationName || this.makeOptions.appName;

		if (this.values.applicationName.length > 40) {
			throw new Error(`applicationName must be 40 characters or less: ${this.values.applicationName}`);
		}

		return this.values.applicationName;
	}

	get executableName() {
		return this._sanatizeExecutableName(this.makerOptions.executableName || this.makeOptions.appName);
	}

	get packagedExecutableName() {
		const linuxApp = new LinuxApp({
			name: this.makeOptions.appName
		});

		return linuxApp.newElectronName;
	}

	get version() {
		return this.makeOptions.packageJSON.version;
	}

	get summary() {
		this.values.summary = this.makerOptions.summary || this.makeOptions.packageJSON.description;

		if (this.values.summary.length > 78) {
			throw new Error('summary must be 78 characters or less');
		}

		return this.values.summary;
	}

	get description() {
		return this.makerOptions.description || this.makeOptions.packageJSON.description;
	}

	get license() {
		return this.makerOptions.license || this.makeOptions.packageJSON.license;
	}

	get icon() {
		this.values.icon = this.makerOptions.icon || this.makeOptions.forgeConfig.packagerConfig.icon;

		if (/\.png$/.test(this.values.icon) === false) {
			this.values.icon += '.png';
		}

		if (path.isAbsolute(this.values.icon) === false) {
			this.values.icon = path.join(process.cwd(), this.values.icon);
		}

		return this.values.icon;
	}

	get confinement() {
		this.values.confinement = this.makerOptions.confinement || 'strict';

		if (['strict', 'devmode', 'classic'].includes(this.values.confinement) === false) {
			throw new Error('confinement must be either `strict`, `devmode` or `classic`');
		}

		return this.values.confinement;
	}

	get grade() {
		this.values.grade = this.makerOptions.grade || 'stable';

		if (['stable', 'devel'].includes(this.values.grade) === false) {
			throw new Error('grade must be either `stable` or `devel`');
		}

		return this.values.grade;
	}

	get categories() {
		return this.makerOptions.categories || [];
	}

	get stagePackages() {
		this.values.stagePackages = this.makerOptions.stagePackages || SnapValues.defaultStagePackages;

		if (this.values.stagePackages.includes('default')) {
			this.values.stagePackages = this.values.stagePackages.filter(i => i !== 'default').concat(SnapValues.defaultStagePackages);
		}

		return this.values.stagePackages;
	}

	get plugs() {
		this.values.plugs = this.makerOptions.plugs || SnapValues.defaultPlugs;

		if (this.values.plugs.includes('default')) {
			this.values.plugs = this.values.plugs.filter(i => i !== 'default').concat(SnapValues.defaultPlugs);
		}

		return this.values.plugs;
	}

	get layout() {
		return this.makerOptions.layout;
	}

	_sanatizeExecutableName(name) {
		const execName = name.toLowerCase().replace(/ /g, '-');
		return execName.replace(/[^a-z\d\\-]/g, '');
	}
}

SnapValues.defaultStagePackages = [
	'libnss3',
	'libnspr4',
	'libasound2',
	'libgconf2-4',
	'libnotify4',
	'libpcre3',
	'libpulse0',
	'libxss1',
	'libxtst6'
];

SnapValues.defaultPlugs = [
	'alsa',
	'browser-support',
	'desktop',
	'desktop-legacy',
	'gsettings',
	'home',
	'network',
	'opengl',
	'pulseaudio',
	'unity7',
	'x11'
];

module.exports = SnapValues;
