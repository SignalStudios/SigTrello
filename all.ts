/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='trello-client.d.ts'/>
///<reference path='chrome.d.ts'/>
///<reference path='mutation-observer.d.ts'/>
///<reference path='sigtrello-dom-card-window.ts'/>
///<reference path='sigtrello-service-links.ts'/>

interface JQueryXHR extends JQueryPromise {} // Some missing methods from jquery-2.1.0.d.ts

module SigTrello {
	if( !Trello.authorized() )
		authorize( );

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

	export function error( message : string ) : void {
		//alert( message );
	}

	var spamLimitCounter = 1000; // Safety
	export function spamLimit( ) : boolean {
		//return --spamLimitCounter < 0;
		return false;
	}

	function authorize( ) : void {
		Trello.authorize({
			type: "popup",
			name: "SigTrello",
			persist: true,
			interactive: true,
			scope: { read: true, write: true, account: false },
			expiration: "never"
		});
	}

	var bodyChildrenObserver = new MutationObserver(function(mutations) {
		var $checklistItemsList = $(".checklist-items-list .checklist-item");
		for( var i = 0; i < $checklistItemsList.length; ++i ) {
			showConvertToCardButton( $checklistItemsList.get(i) );
		}

		var $checklistEditControls = $(".checklist-item-details .edit-controls");
		if( $checklistEditControls.length > 0 ) {
			showConvertToCardLink( $checklistEditControls.get(0) );
		}

		var $listControls = $(".list");
		for( var i = 0; i < $listControls.length; ++i ) {
			showCollapseListLink( $listControls.get(i) );
		}

		sumChecklistTimes( );

		var p4web = "http://perforce.openwatcom.org:4000"; // test placeholder
		if( p4web ) {
			var changelistIcon = p4web + "/submittedChangelistIcon?ac=20";
			var changelistUrlPattern = p4web + "/$1?ac=10";
			var changelistDescPattern = "$1";
			replaceWithServiceLinks( /(?:CL|Changelist)[ ]*[#]?[ ]*(\d+)/i, changelistIcon, changelistUrlPattern, changelistDescPattern );
		}
	});

	bodyChildrenObserver.observe( document.body, { childList: true, characterData: false, attributes: false, subtree: true } );
}
