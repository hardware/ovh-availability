[ ![Codeship Status](https://www.codeship.io/projects/ad642cb0-6e4f-0132-b9bf-66f2bf861e14/status) ](https://www.codeship.io/projects/54318)

ovh-availability v1.1.0
=======================

Application permettant de connaitre la disponibilité des serveurs d'OVH (SoYourStart, Kimsufi)

### Installation

```bash
git clone https://github.com/hardware/ovh-availability.git
npm install
bower update
# Ne pas oublier de modifier la valeur de "DATABASE_URL" dans tous les fichiers migrations/*.js
migrate up
```

Ajouter les variables d'environnement dans un fichier nommé .env à la racine du projet :

```
ENV=development
DATABASE_URL=postgres://user:password@host:port/bddname
SENDGRID_USERNAME=...
SENDGRID_PASSWORD=...
RECAPTCHA_PUBLIC_KEY=...
RECAPTCHA_PRIVATE_KEY=...
APP_URL=http://127.0.0.1:5000/
CRON_KEY=...
COOKIES_SECRET=...
SESSION_SECRET=...
OVH_API_URL=https://ws.ovh.com/dedicated/r2/ws.dispatcher/getAvailability2

# OVH API CREDENTIALS (SMS)
# https://eu.api.ovh.com/createToken/?GET=/sms/&GET=/sms/*/jobs/&POST=/sms/*/jobs/
OVH_APP_KEY=...
OVH_APP_SEC=...
OVH_CON_KEY=...
```

### Lancement de l'application

```bash
foreman start
```

### Support

https://github.com/hardware/ovh-availability/issues

### License
MIT. Voir le fichier ``LICENCE`` pour plus de détails
