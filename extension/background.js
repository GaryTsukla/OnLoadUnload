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
	console.log('Unloading tabs...');
	let tabs;
	try{
		tabs = await TABS['query']({'active':false});
	}catch(e){
		console.log('No tabs unloaded');
		return;
	}
	let c=0;
	let d=0;
	for(let i=0,l=tabs.length;i<l;i++){
		try{
			if(tabs[i]['discarded']){
				d++;
				continue;
			}
			await TABS['discard'](tabs[i]['id']);
			c++;
		}catch(e){
			/* tab skipped */
		}
	}
	consoleWhatHappened(c,d);
};
let consoleWhatHappened=function(c,d){
	let str='';
	if(c>0){
		if(c>1){
			str+=c+' tabs unloaded';
		}else{
			str+='1 tab unloaded';
		}
	}else{
		str+='No tabs unloaded';
	}
	if(d>0){
		if(d>1){
			str+='. '+d+' tabs were already unloaded';
		}else{
			str+='. 1 tab was already unloaded';
		}
	}
	console.log(str);
};
// Creates a menu item so the user can discard all inactive tabs on command
let createMenuItem=function(){
	MENUS['onClicked']['addListener'](checkMenuItem);
	try{
		MENUS['create']({
			'title':'Unload All Inactive Tabs',
			'contexts':['all'],// seems there is no way to add an item on right click of a tab
			'id':'unloadAllTabs'
		},checkError);
	}catch(e){
		/* Menu already created */
	}
};
let checkError=function(){
	if(RUNTIME['lastError']){
		if(RUNTIME['lastError']['message'] && RUNTIME['lastError']['message']=='Cannot create item with duplicate id unloadAllTabs'){
			return;
		}
		console.log(RUNTIME['lastError']);
	}
}
// When someone clicks the menu item
let checkMenuItem=function(info){
	console.log('You clicked the menu item...');
	if(info['menuItemId']=='unloadAllTabs'){
		unloadAllTabs();
	}
};

// Unload all the tabs, when user starts chrome
RUNTIME['onStartup']['addListener'](()=>{
	unloadAllTabs();
});
// Make sure menu item gets created for the user
createMenuItem();