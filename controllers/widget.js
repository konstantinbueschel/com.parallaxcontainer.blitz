var LTAG = '[ParallaxContainerWidget]',
	offset = 0,
	calculatedOffset = 0,
	movement = 0,
	bounce = 0,
	isOnScreen = false,
	parallaxIntensity,
	parallaxItem,
	apiname = '';


/**
 * SEF to organize otherwise inline constructor code
 *
 * @param  {Object} args arguments passed to the controller
 * @returns void
 */
(function constructor(args) {
	
	parallaxIntensity = parseInt(args.parallaxIntensity) || 5;
	parallaxItem = args.children && args.children[0];
	
	_init(args);
	
})($.args);


function _init(args) {
	
	if (args.children[0]) {
		
		var innerMargin = parseInt(args.innerMargin);

		parallaxItem.applyProperties({
			
			height: parseInt(args.height) + innerMargin,
			top: -innerMargin / 2
		});
		
		$._parallaxItemInitTopValue = parallaxItem.top;
		
		$.addListener(parallaxItem, 'postlayout', _postlayout);
		
		$.parallaxContainerView.add(parallaxItem);
	}
	
} // END _init()


function _setViewWithScrollAbility(parent) {
	
	if (OS_IOS) {
		
		parent.addEventListener('scroll', _updateScroll);
	}
	else if (OS_ANDROID) {
		
		parent.addEventListener('touchend', _touchend);
		parent.addEventListener('touchmove', _updateScroll);
	}
	
} // END _setViewWithScrollAbility()


/**
 * postlayout is used to determine whether the UI element is on screen or not
 * AFAIK there is no UI element property which tells whether it's currently rendered on screen or not
 *
 * @private
 * @param {object} event
 * @returns void
 */
function _postlayout(event) {
	
	$.removeListener(event.source, event.type, _postlayout);
	
	isOnScreen || (calculatedOffset = 0);
	
	isOnScreen = true;
	
	return;
	
} // END _postlayout()


function _updateScroll(event) {
	
	if (OS_IOS) {
		
		offset = event.contentOffset.y;
	}
	else if (OS_ANDROID) {
		
		if (event.source.getApiName() != apiname) {
			
			/*If start scrolling while hit a Label or any other small UI element
			 *it might happen happen that the element changes which bubbles the touchmove event.
			 *Cause e.y delivers relative values you have to reset the bounce when the bubbling event changes.
			 * Otherwise the e.y value might change in an inapprioriate way.
			 */
			apiname = event.source.getApiName();
			bounce = event.y;
		}
		
		isOnScreen && (calculatedOffset = ((event.y - bounce) * -1) + movement);
		
		//Only update offset if it fits to the threshold
		if (Math.abs(calculatedOffset) < Math.abs($._parallaxItemInitTopValue) && calculatedOffset >= 0) {
			
			offset = calculatedOffset;
		}
		
		$._parallaxItemInitTopValue = $._parallaxItemInitTopValue + (offset / parallaxIntensity);
	}
	
	parallaxItem.transform = Ti.UI.create2DMatrix().translate(0, (offset / parallaxIntensity));
	
	return;
	
} // END _updateScroll()


function _touchend(event) {
	
	if (OS_ANDROID) {
		
		apiname = '';
		bounce = 0;
		movement = offset;
		isOnScreen = false;
	}
	
	return;
	
} // END _touchend()


// PUBLIC INTERFACE
exports.setViewWithScrollAbility = _setViewWithScrollAbility;
exports.init = _init;
