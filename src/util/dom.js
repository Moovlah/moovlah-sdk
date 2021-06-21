const animateDivPadding = (options) => {
    // console.info(`animateDivPadding`, options, options.div.style);
		return new Promise(function(resolve, reject) {
			const steps = Math.floor(options.duration / 30) + 1;
			const startingHeight = +(options.div.style.paddingBottom === "" ? 0 : options.div.style.paddingBottom.slice(0, -1));
			const increment = Math.round(Math.abs(options.newHeight -  startingHeight) / steps);
			const shrinking = startingHeight > options.newHeight;
      // console.info(`animateDivPadding`, steps, startingHeight, increment, shrinking);
			const adjustHeight = () => {
				const currentHeight = +(options.div.style.paddingBottom === "" ? 0 : options.div.style.paddingBottom.slice(0, -1));
        // console.info(`adjustHeight`, currentHeight);
				if (!shrinking) {
					// growing
          // console.info(`adjustHeight growing`, currentHeight, increment, options.newHeight);
					if (currentHeight + increment >= options.newHeight) {
						// console.info(`adjustHeight incrementing`);
						options.div.style.paddingBottom = options.paddingBottom + "%";
						resolve();
						return;
					} else {
						// console.info(`setting incrementing`);
						options.div.style.paddingBottom = (currentHeight + increment) + "%";
					}
				} else {
          // console.info(`adjustHeight shrinking`);
					// shrinking
					if (currentHeight - increment <= options.newHeight) {
						options.div.style.paddingBottom = options.newHeight + "%";
						resolve();
						return;
					} else {

						options.div.style.paddingBottom = (currentHeight - increment) + "%";
					}
				}
				setTimeout(adjustHeight, 30);
			};
			adjustHeight();
		});
	};


const animateDivHeight = (options) => {
		return new Promise(function(resolve, reject) {
			const steps = Math.floor(options.duration / 30) + 1;
			const startingHeight = +(options.div.style.height === "" ? 0 : options.div.style.height.slice(0, -2));
			const increment = Math.round(Math.abs(options.newHeight -  startingHeight) / steps);
			const shrinking = startingHeight > options.newHeight;
			const adjustHeight = () => {
				const currentHeight = +(options.div.style.height === "" ? 0 : options.div.style.height.slice(0, -2));
				if (!shrinking) {
					// growing
					if (currentHeight + increment >= options.newHeight) {
						options.div.style.height = options.newHeight + "px";
						resolve();
						return;
					} else {
						options.div.style.height = (currentHeight + increment) + "px";
					}
				} else {
					// shrinking
					if (currentHeight - increment <= options.newHeight) {
						options.div.style.height = options.newHeight + "px";
						resolve();
						return;
					} else {
						options.div.style.height = (currentHeight - increment) + "px";
					}
				}
				setTimeout(adjustHeight, 30);
			};
			adjustHeight();
		});
	};

module.exports = {
  animateDivHeight: animateDivHeight,
  animateDivPadding: animateDivPadding
};
