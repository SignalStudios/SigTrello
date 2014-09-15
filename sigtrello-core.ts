/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='chrome.d.ts'/>
///<reference path='mutation-observer.d.ts'/>

interface JQueryXHR extends JQueryPromise {} // Some missing methods from jquery-2.1.0.d.ts

module SigTrello {
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

	export function getBestByNameIndex< T extends NamedThing >( name : string, index : number, items : T[] ) : T {
		if( items.length > index && items[ index ].name == name )
			return items[ index ];

		var matchingName = $.grep( items, (i) => i.name == name, false );
		if( matchingName.length == 1 )
			return matchingName[ 0 ];

		return null; // Ambiguous due to move of duplicately named list item, or no such item.
	}

	export function authorize( ) : boolean{
		if( Trello.authorized( ) )
			return true;

		Trello.authorize({
			type: "popup",
			name: "SigTrello",
			persist: true,
			interactive: true,
			scope: { read: true, write: true, account: false },
			expiration: "never"
		});

		return Trello.authorized( );
	}

	export function getFlatName( $node : JQuery ) : string {
		var $elements = $node.contents( );
		var s = "";
		for( var i = 0; i < $elements.length; ++i ) {
			var element = $elements.get(i);
			if( element.nodeName == 'A' ) {
				s += $(element).attr("href");
			} else {
				s += $(element).text( );
			}
		}
		return s;
	}
}
