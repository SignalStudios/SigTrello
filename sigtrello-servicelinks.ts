/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>

module SigTrello {
	export function replaceWithServiceLinks( pattern : RegExp, iconUrl : string, linkReplacementPattern : string, textReplacementPattern : string ) : void {
		var $where = $(".checklist-item-details-text, .current-comment p, .phenom-desc, .card-detail-item .markeddown p");
		doReplaceWithServiceLinks( $where, pattern, iconUrl, linkReplacementPattern, textReplacementPattern );
	}

	function doReplaceWithServiceLinks( $where : JQuery, pattern : RegExp, iconUrl : string, linkReplacementPattern : string, textReplacementPattern : string ) : void {
		var replacementPattern =
			"<a href=\"" + linkReplacementPattern + "\" target=\"_blank\" class=\"known-service-link\">" +
			"<img src=\"" + iconUrl + "\" class=\"known-service-icon\">" +
			"<span>" + textReplacementPattern + "</span>" +
			"</a>";

		$where.each( (i,elem) => {
			$(elem).contents( ).each( (childI,childElem) => {
				if( childElem.nodeType == Node.TEXT_NODE ) {
					var original = childElem.textContent;
					var replaced = original.replace( pattern, replacementPattern );
					if( original != replaced )
						$(childElem).replaceWith( replaced );
				}
			});
		});
	}
}
