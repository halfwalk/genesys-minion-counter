Hooks.once('init', async function() {

	let imgs = [];
	const skull = "icons/svg/skull.svg";

	for (i=0; i<10;i++) {
		let str = `modules/genesys-minion-counter/images/${i}.png`;
		imgs.push(str);
	}
	let tenPlus = `modules/genesys-minion-counter/images/10.png`;

});

Hooks.on("createToken", (token) => {
	if (token.actor.data.type == "minion") {
		let count = token.actor.data.data.quantity.value;
		if (count < 10 && count > 0) token.data.effects.push(imgs[count]);
		if (count >= 10) token.data.effects.push(tenPlus);
		if (count <= 0) token.data.effects.push(skull);
	}
});

Hooks.on("updateToken", async (...args)=> {	
	let token = args[0]
	if (token.actor.data.type == "minion") {
		let currentEffects =[];
		const minioncount = token.actor.data.data.quantity.value;
			
			for (let eff of token.data.effects) {
				currentEffects.push(eff);
			}
				for (let i of imgs) {
					if (token.data.effects.includes(i)) 
						currentEffects.splice(currentEffects.indexOf(i),1);					
				}
			
			if (token.data.effects.includes(tenPlus)) 
				currentEffects.splice(token.data.effects.indexOf(tenPlus));
			if (token.data.effects.includes(skull))
				currentEffects.splice(token.data.effects.indexOf(skull));
		
		if (minioncount < 10 && minioncount > 0) currentEffects.unshift(imgs[minioncount]);	
		else if (minioncount >= 10) currentEffects.unshift(tenPlus);
		else if (minioncount <= 0) currentEffects.unshift(skull);		
		
		// the setTimeout seems to get rid of the weird random console error ... i don't know why, but it works.
		
		setTimeout(async () => {
		await token.update({effects:currentEffects});},1);
	}
});
