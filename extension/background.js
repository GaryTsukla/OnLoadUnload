let RUNTIME,TABS,MENUS;
try{
	RUNTIME=chrome['runtime'];
	TABS=chrome['tabs'];
	MENUS=chrome['contextMenus'];
}catch(e){
	RUNTIME=browser['runtime'];
	TABS=browser['tabs'];
	MENUS=browser['contextMenus'];
}
// Unloads all tabs, except active tabs
let unloadAllTabs=async function(){
	let tabs;
	try{
		tabs = await TABS['query']({'active':false});
	}catch(e){
		return;
	}
	for(let i=0,l=tabs.length;i<l;i++){
		try{
			await TABS['discard'](tabs[i]['id']);
		}catch(e){
			/* tab skipped */
		}
	}
};
// Creates a menu item so the user can discard all inactive tabs on command
let createMenuItem=function(){
	try{
		MENUS['create']({
			'title':'Unload All Inactive Tabs',
			'contexts':['all'],// seems there is no way to add an item on right click of a tab
			'id':'a1'
		});
		MENUS['onClicked']['addListener'](checkMenuItem);
	}catch(e){
		/* Menu already created */
	}
};
// When someone clicks the menu item
let checkMenuItem=function(info){
	if(info['menuItemId']=='a1'){
		unloadAllTabs();
	}
};

// Unload all the tabs, when user starts chrome
RUNTIME['onStartup']['addListener'](()=>{
	unloadAllTabs();
	createMenuItem();
});
// Need to make sure menu item gets created for the user
RUNTIME['onInstalled']['addListener'](()=>{
	createMenuItem();
});



