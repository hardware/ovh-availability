[ ![Codeship Status](https://www.codeship.io/projects/ad642cb0-6e4f-0132-b9bf-66f2bf861e14/status) ](https://www.codeship.io/projects/54318)

ovh-availability v1.2.0
=======================

Application permettant de connaitre la disponibilité des serveurs d'OVH (SoYourStart, Kimsufi)
http://mondedie.fr/viewtopic.php?id=6161

### Installation

```bash
git clone https://github.com/hardware/ovh-availability.git
cd ovh-availability
npm install
```

Après l'installation des modules, modifier la variable `DATABASE_URL` dans chaque fichier de migration `migrations/*.js` par exemple :

```nodejs
postgres://user:password@host:port/bddname
```

Puis lancer Grunt pour vérifier le code, installer les dépendances de bower, exécuter les migrations de la base de données et compiler les assets :

```bash
grunt run
```

Ajouter les variables d'environnement dans un fichier nommé `.env` à la racine du projet :

```ini
ENV=development
DATABASE_URL=postgres://user:password@host:port/bddname
SENDGRID_USERNAME=...
SENDGRID_PASSWORD=..
RECAPTCHA_PUBLIC_KEY=...
RECAPTCHA_PRIVATE_KEY=...
APP_URL=http://127.0.0.1:5000/
CRON_KEY=...
COOKIES_SECRET=...
SESSION_SECRET=...
OVH_API_URL=https://ws.ovh.com/dedicated/r2/ws.dispatcher/getAvailability2
```

Pour faire fonctionner l'envoi de SMS, il faut générer les credentials via [cette page](https://eu.api.ovh.com/createToken/?GET=/sms/&GET=/sms/*/jobs/&POST=/sms/*/jobs/).

Puis les mettre dans le fichier `.env` :

```ini
OVH_APP_KEY=...
OVH_APP_SEC=...
OVH_CON_KEY=...
```

Créer un fichier nommé `Procfile_dev` avec le contenu suivant :
```js
web: nodemon web.js // npm install -g nodemon
worker: grunt
```

### Lancement de l'application

```bash
foreman start -f Procfile_dev

15:50:47 web.1    | started with pid 32033
15:50:47 worker.1 | started with pid 32034
15:50:47 worker.1 | Running "watch" task
15:50:47 worker.1 | Waiting...
15:50:47 web.1    | 30 Dec 15:50:47 - [nodemon] v1.2.1
15:50:47 web.1    | 30 Dec 15:50:47 - [nodemon] to restart at any time, enter `rs`
15:50:47 web.1    | 30 Dec 15:50:47 - [nodemon] watching: *.*
15:50:47 web.1    | 30 Dec 15:50:47 - [nodemon] starting `node web.js`
15:50:48 web.1    | Express server listening on port 5000
```

### Support

https://github.com/hardware/ovh-availability/issues

### License
MIT. Voir le fichier ``LICENCE`` pour plus de détails
