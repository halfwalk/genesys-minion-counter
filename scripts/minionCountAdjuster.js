let imgs = [];
const skull = "icons/svg/skull.svg";

for (i=0; i<10;i++) {
	let str = `modules/genesys-minion-counter/images/${i}.webp`;
	imgs.push(str);
}
let tenPlus = `modules/genesys-minion-counter/images/10.webp`;

Hooks.on("createToken", (token) => {
	if (token.actor.data.type == "minion") {
		let count = token.actor.data.data.quantity.value;
		if (count < 10 && count > 0) token.data.effects.push(imgs[count]);
		if (count >= 10) token.data.effects.push(tenPlus);
		if (count <= 0) token.data.effects.push(skull);
	}
});

Hooks.on("updateToken", async (...args)=> {	

	if (args[0].actor.data.type == "minion") await updateIcon(args[0],false);	
	
});

async function updateIcon (token) {
	
	let currentEffects =[];
	const minioncount = token.actor.data.data.quantity.value;

	// get all current custom status effects on token

	for (let eff of token.data.effects) {
		currentEffects.push(eff);
	}
	
	// if it has a counter icon already, get rid of it
	
		for (let i of imgs) {
			if (token.data.effects.includes(i)) 
				currentEffects.splice(currentEffects.indexOf(i),1);					
		}
		if (token.data.effects.includes(tenPlus)) 
			currentEffects.splice(token.data.effects.indexOf(tenPlus));
		if (token.data.effects.includes(skull))
			currentEffects.splice(token.data.effects.indexOf(skull));
	
	// put the proper status icon on it
	
	if (minioncount < 10 && minioncount > 0) currentEffects.unshift(imgs[minioncount]);	
	else if (minioncount >= 10) currentEffects.unshift(tenPlus);
	else if (minioncount <= 0) currentEffects.unshift(skull);		
	
	// the setTimeout seems to get rid of the weird random console error ... i don't know why, but it works.
	
	setTimeout(async () => {
	await token.update({effects:currentEffects});},15);
	
}

Hooks.on("updateActor", async (...args)=> {
	const tokenName = args[0].data.token.name;
	if (args[0].data.type == "minion" && !!canvas.tokens.placeables.find(i=> i.data.name == tokenName)) {
		let token = canvas.tokens.placeables.find(i=> i.data.name == tokenName);
		for (const i of canvas.tokens.placeables.filter(i=>i.data.name == tokenName)) {
			await updateIcon(i.document);
		}
	}
});