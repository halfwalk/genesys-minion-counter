var style = {
	fontSize: 100,
	stroke: 'white',
	align:'left',
	strokeThickness:6,
	fill: 'black'
};

Hooks.on("closeSettingsConfig", async () => {
	updateAllIcons();
});

Hooks.on("canvasReady", async () => {
	updateAllIcons();
});

Hooks.once("init", () => {
	game.settings.register("genesys-minion-counter", "textColor", {
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
	game.settings.register("genesys-minion-counter", "isEnabled", {
		name: "Enabled",
		scope: "world",
		config: true,
		type: Boolean,
		default: true
	});

		
});

Hooks.on("createToken", async (...args) => {
	setTimeout(async () => {
		await updateAllIcons();
	}, 5);
});

Hooks.on("updateActor", async (...args) => {
	if (args[0].data.type == "minion") {
		updateAllIcons();
	}	
});

async function updateIcon (token) {
		for (const c of token.icon.children) {
			if (!!c._text) token.icon.removeChild(c)
		}		
		if (game.settings.get("genesys-minion-counter","isEnabled")) {
		
		let minioncount = token.actor.data.data.quantity.value;
		if (minioncount < 0) minioncount = 0;
		let text = new PIXI.Text(minioncount,style);
		text.x -= token.icon.width;
		text.y -= token.icon.height;
		 
		token.icon.addChild(text);
		}
}

async function updateAllIcons() {
	style.fill = game.settings.get("genesys-minion-counter", "textColor");
	for (const token of game.canvas.tokens.placeables.filter(i=> i.actor.data.type == "minion")) {
		updateIcon(token);
	}
}