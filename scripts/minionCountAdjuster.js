var style = {stroke: 'white',align:'center',fill: 'black'};
var fontSize, alpha;
var isEnabled = false;
var rot;
const gmc = "genesys-minion-counter";

class Counter extends PreciseText {
	super() {}
}

Hooks.on("getSceneControlButtons", (controls) => {
		controls[0].tools.push({
			name: "Minion Count Display",
			title: "Minion Count Display",
			icon: "fas fa-hashtag",
			onClick: async () => {isEnabled = !isEnabled;await updateAllIcons();},
			visible: true,
			toggle: true,
			active: isEnabled
		});
});

Hooks.once("init", () => {
	game.settings.register(gmc, "textColor", {
		name: "Text Color",
		scope: "client",
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
		scope: "client",
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
		scope: "client",
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
		name: "Position",
		scope: "client",
		config: true,
		type: String,
		choices: {
			"corner": "Corner",
			"above": "Above"
		},
		default: "icon"
	});
	renderstyle = game.settings.get(gmc, "renderStyle");
	
});

async function updateIcon (token,data) {
	
	for (const c of token.children) {
		if (c instanceof Counter) token.removeChild(c);
	}
	for (const c of token.border?.children) {
		if (c instanceof Counter) token.border.removeChild(c);
	}
	
	if (isEnabled && renderStyle == "above") {
	let minioncount = token.actor.data.data.quantity.value;
	if (minioncount < 0) minioncount = 0;	
	let text = new Counter(minioncount,style);
	text.x = token.icon.position.x - text.width/2;
	text.y -= text.height;
	text.alpha = alpha;

	token.border.addChild(text);
	} else if (isEnabled && renderStyle == "corner") {
		
		let minioncount = token.actor.data.data.quantity?.value;
		if (minioncount < 0) minioncount = 0;
			
		style.strokeThickness = style.fontSize/20;
		let text = new Counter(minioncount,style);
		
		const rot = token.icon.rotation*(180/Math.PI);
		console.log(rot);
		text.x = token.children[1].width - style.fontSize;

		text.alpha = alpha;
		text.isCounter = true;
		 
		token.addChild(text);
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

Hooks.on("updateToken", async (...args) => {
	console.log(args[0]);
	if (isEnabled && renderStyle == "icon" && args[0].actor.type == "minion" && "rotation" in args[1]) {
		console.log(`A minion token rotated to ${args[1].rotation}`);
		await updateIcon(canvas.tokens.placeables.find(i=>i.id == args[0].id),args[1].rotation);
	} else await updateIcon(canvas.tokens.placeables.find(i=>i.id == args[0].id));
});

Hooks.on("closeSettingsConfig", async () => {
	await updateAllIcons();
});
Hooks.on("canvasReady", async () => { await updateAllIcons(); });
Hooks.on("createToken", async (...args) => {

	setTimeout(async () => { 
		await updateAllIcons();}
	,5);
});
Hooks.on("updateActor", async (...args) => {
	if (args[0].data.type == "minion") {
		await updateAllIcons();
	}
});