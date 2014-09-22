/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='sigtrello-all.ts'/>
///<reference path='chrome.d.ts'/>

module SigTrello {
	export module Options {
		export interface Data {
			option_display_workbadge_enable:		boolean;
			option_display_listcollapse_enable:		boolean;
			option_display_p4weblinks_enable:		boolean;
			option_display_checklist2cards_enable:	boolean;
			option_actions_worksum_enable:			boolean;
			option_display_workbadge_text:			string;
			//option_display_workbadge_background:	boolean;
			option_display_p4web_rooturl:			string;
			option_developer_nospam:				boolean;
			option_developer_log_errors:			boolean;
		}

		var defaults : Data = {
			option_display_workbadge_enable:		true,
			option_display_listcollapse_enable:		true,
			option_display_p4weblinks_enable:		true,
			option_display_checklist2cards_enable:	true,
			option_actions_worksum_enable:			true,
			option_display_workbadge_text:			WorkFormat[WorkFormat.Badge_WorkOfCurrent],
			//option_display_workbadge_background:	true,
			option_display_p4web_rooturl:			"http://perforce.openwatcom.org:4000",
			option_developer_nospam:				false,
			option_developer_log_errors:			false,
		};

		function clone( data : Data ) : Data {
			return JSON.parse( JSON.stringify( data ) );
		}

		export var current = clone( defaults );

		export function save( ) {
			current.option_actions_worksum_enable			= $("#option-actions-worksum-enable")			.prop("checked");
			current.option_developer_log_errors				= $("#option-developer-log-errors")				.prop("checked");
			current.option_developer_nospam					= $("#option-developer-nospam")					.prop("checked");
			current.option_display_checklist2cards_enable	= $("#option-display-checklist2cards-enable")	.prop("checked");
			current.option_display_listcollapse_enable		= $("#option-display-listcollapse-enable")		.prop("checked");
			current.option_display_p4web_rooturl			= $("#option-display-p4web-rooturl")			.val( );
			current.option_display_p4weblinks_enable		= $("#option-display-p4weblinks-enable")		.prop("checked");
			current.option_display_workbadge_enable			= $("#option-display-workbadge-enable")			.prop("checked");
			current.option_display_workbadge_text			= $("#option-display-workbadge-text")			.prop("value");
			chrome.storage.sync.set( current, () => {} );
		}

		export function load( ) {
			chrome.storage.sync.get( defaults, newData => {
				current = newData;

				$("#option-actions-worksum-enable")			.prop( "checked",	current.option_actions_worksum_enable );
				$("#option-developer-log-errors")			.prop( "checked",	current.option_developer_log_errors );
				$("#option-developer-nospam")				.prop( "checked",	current.option_developer_nospam );
				$("#option-display-checklist2cards-enable")	.prop( "checked",	current.option_display_checklist2cards_enable );
				$("#option-display-listcollapse-enable")	.prop( "checked",	current.option_display_listcollapse_enable );
				$("#option-display-p4web-rooturl")			.val(				current.option_display_p4web_rooturl );
				$("#option-display-p4weblinks-enable")		.prop( "checked",	current.option_display_p4weblinks_enable );
				$("#option-display-workbadge-enable")		.prop( "checked",	current.option_display_workbadge_enable );
				$("#option-display-workbadge-text")			.prop( "value",		current.option_display_workbadge_text );

				SigTrello.main();
				$("#action-settings-save").on("click",save);
			});
		}

		load( );
	}
}
