const MakerBase = require('@electron-forge/maker-base').default;
const SnapPackager = require('./snap-packager');
const fse = require('fs-extra');
const path = require('path');
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

		const snapFileLocation = await pkg.createSnapPackage();
		const snapFilename = path.basename(snapFileLocation);

		const finalSnapLocation = path.join(options.makeDir, snapFilename);

		fse.renameSync(snapFileLocation, finalSnapLocation);

		const snapcraftDirectory = path.dirname(snapFileLocation);

		fse.rmdirSync(snapcraftDirectory, {recursive: true});

		return [finalSnapLocation];
	}
};
