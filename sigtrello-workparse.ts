/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

module SigTrello {
	export interface IWork {
		original:	number;
		remaining:	number;
		worked:		number;
	}

	export function parseTitleWork( title : string ) : IWork {
		if( !title )
			return null;

		var matchOriginal	= /\((\d*\.?\d*)\)/gi.exec( title );
		var matchWorked		= /\[(\d*\.?\d*)\]/gi.exec( title );
		var matchRemaining	= /\{(\d*\.?\d*)\}/gi.exec( title );

		//console.log( title, matchOriginal, matchWorked, matchRemaining );

		if( matchOriginal || matchWorked || matchRemaining ) {
			var estOriginal	: number = matchOriginal	? parseFloat( matchOriginal[1]	) : 0.0;
			var estWorked	: number = matchWorked		? parseFloat( matchWorked[1]	) : 0.0;
			var estRemaining: number = matchRemaining	? parseFloat( matchRemaining[1]	) : Math.max( estOriginal - estWorked, 0.0 );

			return { "original": estOriginal, "remaining": estRemaining, "worked": estWorked };
		} else {
			return null;
		}
	}

	export function stripTitleWork( title : string ) : string {
		title = title.replace( /\s*\((\d*\.?\d*)\)\s*/i, "" );
		title = title.replace( /\s*\[(\d*\.?\d*)\]\s*/i, "" );
		title = title.replace( /\s*\{(\d*\.?\d*)\}\s*/i, "" );
		return title;
	}

	export function sumWork( works : IWork[] ) : IWork {
		var sum = { "original": 0.0, "remaining": 0.0, "worked": 0.0 };

		for( var i = 0; i < works.length; ++i ) {
			var work = works[i];
			sum.original	+= work.original;
			sum.remaining	+= work.remaining;
			sum.worked		+= work.worked;
		}

		return sum;
	}

	export function toTrelloPointsNumber3( n : number ) {
		var digits = (Math.abs( n ) < 10.0) ? n.toFixed(2)
			: (Math.abs( n ) < 100.0) ? n.toFixed(1)
			: n.toFixed(0);

		return /^(\d+\.??\d*?)\.?0*$/.exec( digits )[1];
	}

	export function toTrelloPointsFormat3( work : IWork ) {
		return "(" + toTrelloPointsNumber3( work.original ) + ") [" + toTrelloPointsNumber3( work.worked ) + "] {" + toTrelloPointsNumber3( work.remaining ) + "}";
	}

	export function toTrelloPointsNumber2( n : number ) {
		var digits = (Math.abs( n ) < 10.0) ? n.toFixed(1)
			: n.toFixed(0);

		return /^(\d+\.??\d*?)\.?0*$/.exec( digits )[1];
	}

	export enum WorkFormat {
		RawTitle,

		Badge_WorkOfCurrent,
		Badge_WorkOfOriginal,
		Badge_RemainingOfCurrent,
		Badge_RemainingOfOriginal,

		Badge_LongDescription,
	}

	export function toTrelloPoints( format : WorkFormat, work : IWork ) {
		switch( format ) {
		case WorkFormat.RawTitle:					return "(" + toTrelloPointsNumber3( work.original ) + ") [" + toTrelloPointsNumber3( work.worked ) + "] {" + toTrelloPointsNumber3( work.remaining ) + "}";

		case WorkFormat.Badge_WorkOfCurrent:		return toTrelloPointsNumber2( work.worked ) + "/" + toTrelloPointsNumber2( work.remaining + work.worked ) + "h";
		case WorkFormat.Badge_WorkOfOriginal:		return toTrelloPointsNumber2( work.worked ) + "/" + toTrelloPointsNumber2( work.original ) + "h";
		case WorkFormat.Badge_RemainingOfCurrent:	return toTrelloPointsNumber2( work.remaining ) + "/" + toTrelloPointsNumber2( work.remaining + work.worked ) + "h";
		case WorkFormat.Badge_RemainingOfOriginal:	return toTrelloPointsNumber2( work.remaining ) + "/" + toTrelloPointsNumber2( work.original ) + "h";

		case WorkFormat.Badge_LongDescription:		return "This card has "+work.worked+"h of "+work.original+"h completed, "+work.remaining+"h remaining";

		default:									error( "Invalid WorkFormat" ); return null;
		}
	}

	export function isWorkComplete( work : IWork ) {
		return work.remaining <= 0;
	}

	export function toTrelloPointsBadgeFormat( work : IWork ) {
	}
}
 