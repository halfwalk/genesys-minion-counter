## Genesys Minion Counter

(starwarsffg 1.6, foundry 0.8.8)

Displays a configurable numeric counter for each minion group token in the scene. The visibility toggle and text settings (render style, text color/size/alpha) are client-side, so each user has control over whether or not they see the counter, and how the numbers look.

It adds a toggle button to the Tokens toolbar.

![img](https://raw.githubusercontent.com/halfwalk/genesys-minion-counter/master/images/toolbar.png)

There are two different render styles.

**Icon** renders the number to the icon layer. It looks prettier and is more compact, and renders on top of the token. However, it rotates along with the token. (I'm still trying to figure out how to handle this). If you never rotate your tokens, this is probably the mode to choose.

![img](https://raw.githubusercontent.com/halfwalk/genesys-minion-counter/master/images/iconstyle.png)

**Border** renders the number above the icon. It takes up more space, but does not rotate along with the icon.



![img](https://raw.githubusercontent.com/halfwalk/genesys-minion-counter/master/images/borderstyle.png)

