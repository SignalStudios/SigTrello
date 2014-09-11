/*!
 * SigTrello TypeScript definition file for BA Debounce
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

interface JQueryStatic {
	getURL( url : string ) : string;

	throttle<CB>( delay : number, no_trailing : boolean, callback : CB, debounce_mode? : boolean ) : CB;
	throttle<CB>( delay : number, callback : CB, debounce_mode? : boolean ) : CB;

	debounce<CB>( delay : number, at_begin : boolean, callback : CB ) : CB;
	debounce<CB>( delay : number, callback : CB ) : CB;
}
