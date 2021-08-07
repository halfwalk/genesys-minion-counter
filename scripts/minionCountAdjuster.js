var style = {stroke: 'white',align:'center',fill: 'black'};
var fontSize;
var isEnabled = false;
const gmc = "genesys-minion-counter";

Hooks.on("getSceneControlButtons", (controls) => {
	console.log(controls);
	 if (game.user.isGM) {
		controls[0].tools.push({
			name: "Minion Count Display",
			title: "Minion Count Display",
			icon: "fas fa-hashtag",
			onClick: () => toggleVisible(),
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
game.socket.on('module.genesys-minion-counter', (data) => {
	if (data.operation === 'pushToggle') pushToggle(data);
	if (data.operation === 'pushUpdate') pushUpdate(data);
});
});

async function updateIcon (token) {
	for (const c of token.border.children) {
		if (!!c._text) token.border.removeChild(c)
	
	}
	if (isEnabled) {
		
	let minioncount = token.actor.data.data.quantity.value;
	 if (minioncount < 0) minioncount = 0;
			
	style.strokeThickness = style.fontSize/20;
		
	let text = new PreciseText(minioncount,style);
	text.x = token.icon.position.x - text.width/2;
	text.y -= text.height;
	text.alpha = game.settings.get(gmc, "fontAlpha");

	token.border.addChild(text);
	}
	
	
	/*** attach counter to border.
	**** renders neatly over the corner of the token, but also rotatse with the token ****
	***

		for (const c of token.icon.children) {
			if (!!c._text) token.icon.removeChild(c)
		}		
		if (isEnabled) {
		
		let minioncount = token.actor.data.data.quantity.value;
		if (minioncount < 0) minioncount = 0;
			
		style.fontSize = 100;
		style.strokeThickness = style.fontSize/20;
		
		let text = new PreciseText(minioncount,style);
		text.x -= token.icon.texture.width/2;
		text.y -= token.icon.texture.height/2;
		text.rotation = token.icon.rotation;
		 
		token.icon.addChild(text);
		}
*/
}

async function updateAllIcons() {
	style.fill = game.settings.get(gmc, "textColor");
	style.fontSize = game.settings.get(gmc, "fontSize");
	
	for (const token of game.canvas.tokens.placeables.filter(i=> i.actor.data.type == "minion")) {
		await updateIcon(token);
	}
}

async function toggleVisible() {
	isEnabled = !isEnabled;
	game.socket.emit('module.genesys-minion-counter', {
		operation: 'pushToggle',
		user: game.user.id,
		counterIsVisible: isEnabled
	});
	await updateAllIcons();
}

Hooks.on("closeSettingsConfig", async () => {
	game.socket.emit('module.genesys-minion-counter', {
	operation: 'pushUpdate'});
	await updateAllIcons();
});
Hooks.on("canvasReady", async () => { await updateAllIcons(); });
Hooks.on("createToken", async () => { setTimeout(async () => { await updateAllIcons();}, 5);});
Hooks.on("updateActor", async (...args) => {if (args[0].data.type == "minion") { await updateAllIcons();}});

async function pushToggle(data) {
	isEnabled = data.counterIsVisible;
	await updateAllIcons();
}

async function pushUpdate(data) {
  await updateAllIcons();
}