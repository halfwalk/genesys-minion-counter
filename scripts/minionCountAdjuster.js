var imgs = [];

for (i=1; i<=10;i++) {
	const str = `modules/genesys-minion-counter/images/${i}.webp`;
	imgs.push(str);
}
imgs.unshift("icons/svg/skull.svg");

Hooks.on("createToken", (token) => {
	if (token.actor.data.type == "minion") {
		const count = token.actor.data.data.quantity.value;
		if (count < 10 && count > 0) token.data.effects.push(imgs[count]);
		if (count >= 10) token.data.effects.push(imgs[10]);
		if (count <= 0) token.data.effects.push(imgs[0]);
	}
});

Hooks.on("updateActor", async (...args)=> {
	
	if (args[0].data.type == "minion" && args[0].data.token.actorLink) {
		for (const token of canvas.tokens.placeables.filter(i => i.actor.data.type == "minion" && i.data.actorLink)) {
			await updateIcon(token.document);
		}
	} else {
		for (const token of canvas.tokens.placeables.filter(i => i.actor.data.type == "minion" && !i.data.actorLink)) {
			await updateIcon(token.document);
		}
	}
});

async function updateIcon (token) {
	
	let currentEffects =[];
	const minioncount = token.actor.data.data.quantity.value;

	// get all current custom status effects on token

	for (const eff of token.data.effects) {
		currentEffects.push(eff);
	}
	
	// get rid of any existing counter icons
	
		for (const i of imgs) {
			if (token.data.effects.includes(i)) 
				currentEffects.splice(currentEffects.indexOf(i),1);					
		}
	
	// put the proper status icon on it
	
	if (minioncount < 10 && minioncount > 0) currentEffects.unshift(imgs[minioncount]);	
	else if (minioncount >= 10) currentEffects.unshift(imgs[10]);
	else currentEffects.unshift(imgs[0]);		
	
	await token.update({effects:currentEffects})
}

