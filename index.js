const path = require('path');
const {spawn} = require('child_process');

const MakerBase = require('@electron-forge/maker-base').default;
const fse = require('fs-extra');
const debug = require('debug');

const SnapPackager = require('./snap-packager.js');

const log = debug('electron-forge-maker-snap:maker-snap');

log.log = console.log.bind(console);

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
		log('snap maker has been initiated from electron-forge');

		const pkg = new SnapPackager({
			makeOptions: options,
			makerOptions: this.config,
			dependencies: {
				fse,
				process,
				spawn
			}
		});

		log('Creating snapcraft related files');
		pkg.createSnapcraftFiles();
		log('Snapcraft related files created');

		log('Creating snap file');
		const snapFileLocation = await pkg.createSnapPackage();
		log(`Snap file created at: ${snapFileLocation}`);

		const snapFilename = path.basename(snapFileLocation);

		const finalSnapLocation = path.join(options.makeDir, snapFilename);

		log(`Moving snap file from ${snapFileLocation} to ${finalSnapLocation}`);
		fse.renameSync(snapFileLocation, finalSnapLocation);
		log(`Snap file moved to: ${finalSnapLocation}`);

		const snapcraftDirectory = path.dirname(snapFileLocation);
		fse.rmSync(snapcraftDirectory, {recursive: true});
		log(`Tidy up; snapcraft files deleted from: ${snapcraftDirectory}`);

		log(`Finishing snap maker, passing back to electron-forge with: ${finalSnapLocation}`);
		return [finalSnapLocation];
	}
};
