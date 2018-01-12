Pour Interfaces Tactiles & Réparties, ceux qui vont utiliser la table, voici les 3 repos dont vous aurez besoin: 
https://github.com/AtelierIHMTable

Ah oui et il faut nodejs

Voici une explication que Christian Brel nous avait envoyé:

"

Simulateur/Emulateur : 
Le site de TUIO est : https://tuio.org/
Dans la partie "Software", vous avez une section "TUIO Simulators". Il faut prendre le premier qui est écrit en JAVA et qui fonctionne normalement de partout (au moins sous Windows et MacOS).

TUIOClient :
C'est l'interface entre les évènements de la table / du simulateur et TUIOManager.
Il a pour but "d'interpréter" les évènements OSC (Open Source Control - utilisé par TUIO) et envoyer les résultats sur un bus de message mis en place avec Socket.IO. Le TUIOManager gère la réception.

- Après avoir cloné le dépôt :
> npm install
> npm run develop

TUIOManager : 
C'est la base des projets qui doivent être développé sur la table. TUIOManager gère les évènements des différents types (Touch ou Tag) qui sont la création, la mise à jour ou la suppression des éléments sur la table.

Il définit des classes Javascript de base : TUIOTouch et TUIOTag correspondent respectivement à un Touch (doigt) posé sur la table et à un Tag (un objet) posé sur la table.
TUIOWidget est une classe de base pour construire un élément graphique sur la table sur lequel va pouvoir interagir des Touches ou des Tags.

Vous allez le mettre à jour suivant la création des différents Widgets que vous allez créé. L'idée de TUIOManager est d'être utilisé comme une librairie dans l'application. Et donc à priori, c'est dans cette librairie que nous aimerions proposé différents Widget prêts à l'emploi.

Dans sa version actuelle, aucun Widget n'est disponible. Vous avez un exemple d'utilisation de cette "librairie" dans TUIOSamples et dans les projets KnaP et CreaStorm de l'année dernière.

2 modes sont disponibles pour TUIOManager : Soit l'utilisation comme une librairie et dans ce cas là (cf TUIOSamples) vous l'installer comme une dépendance npm dans votre projet (npm install tuiomanager - actuellement version 1.2.3). Soit l'utilisation en mode développement (ce que vous allez certainement faire à un moment donné) et dans ce cas là, c'est un peu plus tricky. L'idée est de déclarer TUIOManager comme une librairie globale sur votre machine et de l'utiliser tel quel dans le projet. Ici on utilise les commandes npm link qui fournissent un jeu de lien symbolique pour que tout cela fonctionne. Ainsi toutes modifications faites sur TUIOManager sont directement accessibles dans votre projet. (et sans avoir à faire de release dans tous les sens à chaque fois que vous changez un caractère et que vous voulez tester ce que ça donne dans le projet). Il y a des scripts qui font ça pour vous =>
- Après avoir cloné le dépôt :
> npm install
> npm run devMode

TUIOSamples :
C'est un exemple très simple d'utilisation de TUIOManager.

2 modes disponibles, correspondants aux 2 modes d'utilisation de TUIOManager. (dans un premier temps, faites le dans le mode normal d'utilisation, puis on verra par la suite pour le "devMode").

Mode classique =>
> npm install
> npm run start OU npm start

Ensuite il faut ouvrir un navigateur sur http://localhost:3000/ et utiliser le simulateur pour manipuler la photo apparue (avec le doigt ou avec un tag que vous pouvez faire tourner - molette souris - pour faire tourner la photo). Attention : il faut utiliser la capacité des outils de dev de votre navigateur pour être dans la résolution 1920*1080 (1080p).

Mode dev => (procédure à vérifier)
> npm run devMode
> npm install
> npm run start OU npm start 
"

Les widgets créés durant le PFE sont visibles dans TUIOManager/widgets, sur la branche develop.