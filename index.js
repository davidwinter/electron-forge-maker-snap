const MakerBase = require('@electron-forge/maker-base').default;
const SnapPackager = require('./snap-packager');
const fse = require('fs-extra');
const path = require('path');
const {spawn} = require('child_process');
const debug = require('debug')('forge-maker-snap:maker-snap');

debug.log = console.log.bind(console);

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
		debug('snap maker has been initiated from electron-forge');

		const pkg = new SnapPackager({
			makeOptions: options,
			makerOptions: this.config,
			dependencies: {
				fse,
				process,
				spawn
			}
		});

		debug('Creating snapcraft related files');
		pkg.createSnapcraftFiles();
		debug('Snapcraft related files created');

		debug('Creating snap file');
		const snapFileLocation = await pkg.createSnapPackage();
		debug(`Snap file created at: ${snapFileLocation}`);

		const snapFilename = path.basename(snapFileLocation);

		const finalSnapLocation = path.join(options.makeDir, snapFilename);

		debug(`Moving snap file from ${snapFileLocation} to ${finalSnapLocation}`);
		fse.renameSync(snapFileLocation, finalSnapLocation);
		debug(`Snap file moved to: ${finalSnapLocation}`);

		const snapcraftDirectory = path.dirname(snapFileLocation);
		fse.rmdirSync(snapcraftDirectory, {recursive: true});
		debug(`Tidy up; snapcraft files deleted from: ${snapcraftDirectory}`);

		debug(`Finishing snap maker, passing back to electron-forge with: ${finalSnapLocation}`);
		return [finalSnapLocation];
	}
};
