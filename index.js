const MakerBase = require('@electron-forge/maker-base').default;

module.exports = class MakerSnap extends MakerBase {
	// Name = 'MakerSnap';
	// DefaultPlatforms = ['linux'];

	constructor(configFetcher, providedPlatforms) {
		super(configFetcher, providedPlatforms);

		this.name = 'MakerSnap';
		this.defaultPlatforms = ['linux'];
	}

	isSupportedOnCurrentPlatform() {
		return true;
	}

	async make(options) {
		console.log(options);
		console.log(this.config);

		throw new Error('Not yet implemented');
	}
};
