var style = {stroke: 'white',align:'center',fill: 'black'};
var fontSize, alpha;
var isEnabled = false;
const gmc = "genesys-minion-counter";

var socket;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule(gmc);
	socket.register("pushToggle", pushToggle);
	socket.register("pushUpdate", pushUpdate);
});

Hooks.on("getSceneControlButtons", (controls) => {
	 if (game.user.isGM) {
		controls[0].tools.push({
			name: "Minion Count Display",
			title: "Minion Count Display",
			icon: "fas fa-hashtag",
			onClick: () => {isEnabled = !isEnabled;socket.executeForEveryone("pushToggle", isEnabled);},
			visible: true,
			toggle: true,
			active: isEnabled
		});
	 }
});

Hooks.once("init", () => {
	game.settings.register(gmc, "textColor", {
		name: "Text Color",
		scope: "world",
		config: true,
		type: String,
		choices: {
			"black": "Black",
			"white": "White",
			"#fcba03": "Gold",
			"#fc0303": "Red",
			"#0bd600": "Lime",
			"#5a3ef7": "Blue"
		},
		default: "black",
	});
	game.settings.register(gmc, "fontSize", {
		name: "Font Size",
		scope: "world",
		config: true,
		type: Number,
		range: {
			min: 12,
			max: 36,
			step: 1
		},
		default: 24
	});
	game.settings.register(gmc, "fontAlpha", {
		name: "Font Alpha",
		hint: "(make it partially transparent)",
		scope: "world",
		config: true,
		type: Number,
		range: {
			min: 0,
			max: 1,
			step: 0.1
		},
		default: 0.8
	});
	game.settings.register(gmc, "renderStyle", {
		name: "Render Style",
		hint: `"Border" renders the counter above the token. It takes up more space, but does not rotate with the token. "Icon" renders on top of the token, more neatly in the corner. It's more compact, but suffers the side effect of rotating along with the token. If you don't ever rotate your tokens, "Icon" will probably look better.`,
		scope: "world",
		config: true,
		type: String,
		choices: {
			"border": "Border",
			"icon": "Icon"
		},
		default: "border"
	});
});

async function updateIcon (token) {
	
	if ("children" in token.border) {
		for (const c of token.border.children) {
			if (!!c._text) token.border.removeChild(c);
		}
	}
	if ("children" in token.icon) {
		for (const c of token.icon.children) {
			if (!!c._text) token.icon.removeChild(c);
		}
	}
	if (isEnabled && renderStyle == "border") {
//		console.log("a wild update appeared!");
	let minioncount = token.actor.data.data.quantity.value;
	if (minioncount < 0) minioncount = 0;	
	let text = new PreciseText(minioncount,style);
	text.x = token.icon.position.x - text.width/2;
	text.y -= text.height;
	text.alpha = alpha;

	token.border.addChild(text);
	} else if (isEnabled && renderStyle == "icon") {
	
	/*** attach counter to icon.
	**** renders neatly over the corner of the token, but also rotates with the token ****
	****/
		
		let minioncount = token.actor.data.data.quantity.value;
		if (minioncount < 0) minioncount = 0;
			
		style.strokeThickness = style.fontSize/20;
		let text = new PreciseText(minioncount,style);
	
		text.x -= token.icon.texture.width/2;
		text.y -= token.icon.texture.height/2;
		text.alpha = alpha;
		text.height *= 1/token.icon.transform.scale.y;
		text.width *= 1/token.icon.transform.scale.x;
		 
		token.icon.addChild(text);
	}
}

async function updateAllIcons() {
	style.fill = game.settings.get(gmc, "textColor");
	style.fontSize = game.settings.get(gmc, "fontSize");
	style.strokeThickness = style.fontSize/20;
	alpha = game.settings.get(gmc,"fontAlpha");
	renderStyle = game.settings.get(gmc,"renderStyle");
	for (const token of game.canvas.tokens.placeables.filter(i=> i.actor.data.type == "minion")) {
		await updateIcon(token);
	}
}

/* async function toggleVisible() {
	isEnabled = !isEnabled;
	game.socket.emit('module.genesys-minion-counter', {
		operation: 'pushToggle',
		user: game.user.id,
		counterIsVisible: isEnabled
	});
	await updateAllIcons();
}*/

/*Hooks.on("updateToken", async (...args) => {
	console.log(args[0]);
	if (isEnabled && renderStyle == "icon" && args[0].actor.type == "minion" && "rotation" in args[1]) {
		console.log(`A minion token rotated to ${args[1].rotation}`);
		await updateIcon(canvas.tokens.placeables.find(i=>i.id == args[0].id));
	}
});
*/
		

Hooks.on("closeSettingsConfig", async () => {
	await updateAllIcons();
	socket.executeForEveryone("pushUpdate",{"isEnabled":isEnabled,"renderStyle":renderStyle});
});
Hooks.on("canvasReady", async () => { await updateAllIcons(); });
Hooks.on("createToken", async (...args) => {
//	console.log(args[0]);
	setTimeout(async () => { 
		await updateAllIcons();}
	,5);
});
Hooks.on("updateActor", async (...args) => {if (args[0].data.type == "minion") { await updateAllIcons();}});

async function pushToggle(toggle) {
	isEnabled = !isEnabled;
//	console.log("pushing toggle state:" + toggle);
	isEnabled = toggle;
	await updateAllIcons();
}

async function pushUpdate(data) {
//	console.log("update pushed from GM");
  await updateAllIcons();
}
