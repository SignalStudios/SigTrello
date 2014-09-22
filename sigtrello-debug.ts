/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

module SigTrello {
	export function error( message : string ) : void {
		if( Options.current.option_developer_log_errors )
			alert( message );
	}

	var spamLimitCounter = 100; // Safety
	export function spamLimit( ) : boolean {
		return Options.current.option_developer_nospam && --spamLimitCounter < 0;
	}
}
