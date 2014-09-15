/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

module SigTrello {
	export function error( message : string ) : void {
		//alert( message );
	}

	var spamLimitCounter = 100; // Safety
	export function spamLimit( ) : boolean {
		//return --spamLimitCounter < 0;
		return false;
	}
}
