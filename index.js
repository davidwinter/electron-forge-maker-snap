const MakerBase = require('@electron-forge/maker-base').default;
const SnapPackager = require('./snap-packager');
const fse = require('fs-extra');
const {spawn} = require('child_process');

module.exports = class MakerSnap extends MakerBase {
	constructor(configFetcher, providedPlatforms) {
		super(configFetcher, providedPlatforms);

		this.name = 'snap';
		this.defaultPlatforms = ['linux'];
	}

	isSupportedOnCurrentPlatform() {
		return true;
	}

	async make(options) {
		const pkg = new SnapPackager({
			makeOptions: options,
			makerOptions: this.config,
			dependencies: {
				fse,
				process,
				spawn
			}
		});

		pkg.createSnapcraftFiles();
		pkg.createSnapPackage();

		return [`${pkg.values.executableName}_${pkg.values.version}_amd64.snap`];
	}
};
